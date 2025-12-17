import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { encode as hexEncode } from "https://deno.land/std@0.208.0/encoding/hex.ts"

// Use Web Crypto API for password hashing (compatible with Deno Deploy)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const passwordData = encoder.encode(password)
  
  // Combine salt and password
  const combined = new Uint8Array(salt.length + passwordData.length)
  combined.set(salt)
  combined.set(passwordData, salt.length)
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  const hashArray = new Uint8Array(hashBuffer)
  
  // Return salt:hash format
  const saltHex = new TextDecoder().decode(hexEncode(salt))
  const hashHex = new TextDecoder().decode(hexEncode(hashArray))
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder()
  
  // Handle legacy plain text passwords (for migration)
  if (!storedHash.includes(':')) {
    return password === storedHash
  }
  
  const [saltHex, expectedHashHex] = storedHash.split(':')
  
  // Decode salt from hex
  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
  const passwordData = encoder.encode(password)
  
  // Combine salt and password
  const combined = new Uint8Array(saltBytes.length + passwordData.length)
  combined.set(saltBytes)
  combined.set(passwordData, saltBytes.length)
  
  // Hash and compare
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = new TextDecoder().decode(hexEncode(hashArray))
  
  return hashHex === expectedHashHex
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple token generation using crypto
async function generateAdminToken(): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const token = btoa(String.fromCharCode(...randomBytes))
  return token
}

// Token storage (in-memory for edge function - tokens expire on function restart)
// In production, consider using a database table for persistent sessions
const adminTokens = new Map<string, { expires: number }>()

function isValidAdminToken(token: string | null): boolean {
  if (!token) return false
  const session = adminTokens.get(token)
  if (!session) return false
  if (Date.now() > session.expires) {
    adminTokens.delete(token)
    return false
  }
  return true
}

// Valid Algerian wilayas
const VALID_WILAYAS = [
  'adrar', 'chlef', 'laghouat', 'oum el bouaghi', 'batna', 'béjaïa', 'biskra', 'béchar',
  'blida', 'bouira', 'tamanrasset', 'tébessa', 'tlemcen', 'tiaret', 'tizi ouzou', 'alger',
  'djelfa', 'jijel', 'sétif', 'saïda', 'skikda', 'sidi bel abbès', 'annaba', 'guelma',
  'constantine', 'médéa', 'mostaganem', 'msila', 'mascara', 'ouargla', 'oran', 'el bayadh',
  'illizi', 'bordj bou arréridj', 'boumerdès', 'el tarf', 'tindouf', 'tissemsilt', 'el oued',
  'khenchela', 'souk ahras', 'tipaza', 'mila', 'aïn defla', 'naâma', 'aïn témouchent',
  'ghardaïa', 'relizane', 'timimoun', 'bordj badji mokhtar', 'ouled djellal', 'béni abbès',
  'in salah', 'in guezzam', 'touggourt', 'djanet', 'el meghaier', 'el meniaa'
]

// Validate phone number (Algerian format)
function isValidPhoneNumber(phone: string): boolean {
  // Algerian phone: starts with 0, followed by 5/6/7 and 8 more digits
  const phoneRegex = /^0[567]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Sanitize string input
function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, maxLength).replace(/<[^>]*>/g, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()
    
    // Extract admin token from request
    const authHeader = req.headers.get('authorization')
    const adminToken = authHeader?.replace('Bearer ', '') || null

    // Actions that don't require authentication
    const publicActions = ['verify_password', 'submit_order']
    
    // Check authentication for protected actions
    if (!publicActions.includes(action) && !isValidAdminToken(adminToken)) {
      console.log(`Unauthorized access attempt for action: ${action}`)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    switch (action) {
      case 'verify_password': {
        const { password } = data
        
        if (!password || typeof password !== 'string') {
          return new Response(JSON.stringify({ success: false, error: 'Invalid password format' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const { data: settings, error } = await supabase
          .from('admin_settings')
          .select('password_hash')
          .single()
        
        if (error) throw error
        
        // Use verifyPassword to compare password
        const isValid = await verifyPassword(password, settings.password_hash)
        
        if (isValid) {
          // Generate admin token
          const token = await generateAdminToken()
          // Token expires in 24 hours
          adminTokens.set(token, { expires: Date.now() + 24 * 60 * 60 * 1000 })
          
          console.log('Admin login successful')
          return new Response(JSON.stringify({ success: true, token }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        return new Response(JSON.stringify({ success: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'verify_token': {
        // Just verify the token is valid (already checked above)
        return new Response(JSON.stringify({ valid: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'logout': {
        if (adminToken) {
          adminTokens.delete(adminToken)
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'change_password': {
        const { oldPassword, newPassword } = data
        
        if (!oldPassword || !newPassword || typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
          return new Response(JSON.stringify({ success: false, error: 'Invalid password format' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (newPassword.length < 8) {
          return new Response(JSON.stringify({ success: false, error: 'Password must be at least 8 characters' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Verify old password first
        const { data: settings, error: fetchError } = await supabase
          .from('admin_settings')
          .select('id, password_hash')
          .single()
        
        if (fetchError) throw fetchError
        
        const oldPasswordValid = await verifyPassword(oldPassword, settings.password_hash)
        if (!oldPasswordValid) {
          return new Response(JSON.stringify({ success: false, error: 'Incorrect old password' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Hash new password and update
        const newHash = await hashPassword(newPassword)
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({ password_hash: newHash })
          .eq('id', settings.id)
        
        if (updateError) throw updateError
        
        console.log('Admin password changed successfully')
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'submit_order': {
        // Server-side order validation
        const { customerName, phone, wilaya, deliveryType, items, total } = data
        
        // Validate customer name
        const sanitizedName = sanitizeString(customerName, 100)
        if (!sanitizedName || sanitizedName.length < 2) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid customer name' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Validate phone number
        if (!isValidPhoneNumber(phone)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid phone number. Use Algerian format (e.g., 0550000000)' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Validate wilaya
        const normalizedWilaya = wilaya?.toLowerCase().trim()
        if (!normalizedWilaya || !VALID_WILAYAS.includes(normalizedWilaya)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid wilaya' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Validate delivery type
        if (!['home', 'desk'].includes(deliveryType)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid delivery type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Validate items
        if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid order items' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Verify products exist and recalculate total server-side
        let calculatedTotal = 0
        const validatedItems = []
        
        for (const item of items) {
          if (!item.product?.id || !item.size || !item.quantity) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid item format' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          // Limit quantity per item
          if (item.quantity < 1 || item.quantity > 10) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid quantity (max 10 per item)' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          // Fetch actual product from database
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, title, price, stock, sizes')
            .eq('id', item.product.id)
            .single()
          
          if (productError || !product) {
            return new Response(JSON.stringify({ success: false, error: `Product not found: ${item.product.id}` }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          // Verify size is available
          if (!product.sizes.includes(item.size)) {
            return new Response(JSON.stringify({ success: false, error: `Size ${item.size} not available for ${product.title}` }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          // Verify stock
          if (product.stock < item.quantity) {
            return new Response(JSON.stringify({ success: false, error: `Insufficient stock for ${product.title}` }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          calculatedTotal += product.price * item.quantity
          validatedItems.push({
            product: {
              id: product.id,
              title: product.title,
              price: product.price
            },
            size: item.size,
            quantity: item.quantity
          })
        }
        
        // Insert order with server-calculated total
        const { data: newOrder, error: insertError } = await supabase
          .from('orders')
          .insert({
            customer_name: sanitizedName,
            phone: phone.replace(/\s/g, ''),
            wilaya: normalizedWilaya,
            delivery_type: deliveryType,
            items: validatedItems,
            total: calculatedTotal
          })
          .select()
          .single()
        
        if (insertError) throw insertError
        
        console.log(`Order created: ${newOrder.id}`)
        return new Response(JSON.stringify({ success: true, order: newOrder }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_products': {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return new Response(JSON.stringify({ products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'add_product': {
        const { product } = data
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            title: sanitizeString(product.title, 200),
            price: Math.max(0, Number(product.price) || 0),
            original_price: product.originalPrice ? Math.max(0, Number(product.originalPrice)) : null,
            images: Array.isArray(product.images) ? product.images.slice(0, 10) : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            stock: Math.max(0, Math.min(9999, Number(product.stock) || 0)),
            category: product.category,
            description: product.description ? sanitizeString(product.description, 2000) : null,
            drop_id: product.dropId || null,
            is_new: Boolean(product.isNew),
            has_fire_effect: Boolean(product.hasFireEffect),
          })
          .select()
          .single()
        
        if (error) throw error
        console.log(`Product added: ${newProduct.id}`)
        return new Response(JSON.stringify({ product: newProduct }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_product': {
        const { id, updates } = data
        const dbUpdates: Record<string, unknown> = {}
        
        if (updates.title !== undefined) dbUpdates.title = sanitizeString(updates.title, 200)
        if (updates.price !== undefined) dbUpdates.price = Math.max(0, Number(updates.price) || 0)
        if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice ? Math.max(0, Number(updates.originalPrice)) : null
        if (updates.images !== undefined) dbUpdates.images = Array.isArray(updates.images) ? updates.images.slice(0, 10) : []
        if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
        if (updates.stock !== undefined) dbUpdates.stock = Math.max(0, Math.min(9999, Number(updates.stock) || 0))
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.description !== undefined) dbUpdates.description = updates.description ? sanitizeString(updates.description, 2000) : null
        if (updates.dropId !== undefined) dbUpdates.drop_id = updates.dropId || null
        if (updates.isNew !== undefined) dbUpdates.is_new = Boolean(updates.isNew)
        if (updates.hasFireEffect !== undefined) dbUpdates.has_fire_effect = Boolean(updates.hasFireEffect)
        
        // Check if product became sold out
        if (updates.stock === 0) {
          dbUpdates.sold_out_at = new Date().toISOString()
        } else if (updates.stock !== undefined && updates.stock > 0) {
          dbUpdates.sold_out_at = null
        }
        
        const { data: product, error } = await supabase
          .from('products')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        console.log(`Product updated: ${id}`)
        return new Response(JSON.stringify({ product }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'delete_product': {
        const { id } = data
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        console.log(`Product deleted: ${id}`)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'upload_media': {
        // This action validates the upload request but actual upload happens client-side with signed URL
        const { fileName, contentType } = data
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
        if (!allowedTypes.includes(contentType)) {
          return new Response(JSON.stringify({ error: 'Invalid file type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Generate signed upload URL
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizeString(fileName, 50)}`
        const { data: signedUrl, error } = await supabase.storage
          .from('media')
          .createSignedUploadUrl(filePath)
        
        if (error) throw error
        
        return new Response(JSON.stringify({ signedUrl: signedUrl.signedUrl, path: filePath }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_drops': {
        const { data: drops, error } = await supabase
          .from('drops')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return new Response(JSON.stringify({ drops }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'create_drop': {
        const { drop } = data
        const { data: newDrop, error } = await supabase
          .from('drops')
          .insert({
            name: sanitizeString(drop.name, 100),
            release_date: drop.releaseDate,
            lookbook_images: Array.isArray(drop.lookbookImages) ? drop.lookbookImages.slice(0, 20) : [],
            background_url: drop.backgroundUrl || null,
            background_type: ['image', 'gif', 'video'].includes(drop.backgroundType) ? drop.backgroundType : 'image',
            is_active: true,
            global_fire_effect: Boolean(drop.globalFireEffect),
          })
          .select()
          .single()
        
        if (error) throw error
        console.log(`Drop created: ${newDrop.id}`)
        return new Response(JSON.stringify({ drop: newDrop }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_drop': {
        const { id, updates } = data
        const dbUpdates: Record<string, unknown> = {}
        
        if (updates.name !== undefined) dbUpdates.name = sanitizeString(updates.name, 100)
        if (updates.releaseDate !== undefined) dbUpdates.release_date = updates.releaseDate
        if (updates.lookbookImages !== undefined) dbUpdates.lookbook_images = Array.isArray(updates.lookbookImages) ? updates.lookbookImages.slice(0, 20) : []
        if (updates.backgroundUrl !== undefined) dbUpdates.background_url = updates.backgroundUrl
        if (updates.backgroundType !== undefined) dbUpdates.background_type = ['image', 'gif', 'video'].includes(updates.backgroundType) ? updates.backgroundType : 'image'
        if (updates.isActive !== undefined) dbUpdates.is_active = Boolean(updates.isActive)
        if (updates.globalFireEffect !== undefined) dbUpdates.global_fire_effect = Boolean(updates.globalFireEffect)
        
        const { data: drop, error } = await supabase
          .from('drops')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        console.log(`Drop updated: ${id}`)
        return new Response(JSON.stringify({ drop }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'cancel_drop': {
        const { id } = data
        
        // Remove drop_id from products and set is_active to false
        await supabase
          .from('products')
          .update({ drop_id: null })
          .eq('drop_id', id)
        
        const { error } = await supabase
          .from('drops')
          .update({ is_active: false })
          .eq('id', id)
        
        if (error) throw error
        console.log(`Drop cancelled: ${id}`)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'complete_drop': {
        const { id } = data
        
        // Mark all products in this drop as is_new and visible
        await supabase
          .from('products')
          .update({ is_new: true })
          .eq('drop_id', id)
        
        // Deactivate the drop
        const { error } = await supabase
          .from('drops')
          .update({ is_active: false })
          .eq('id', id)
        
        if (error) throw error
        console.log(`Drop completed: ${id}`)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_orders': {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return new Response(JSON.stringify({ orders }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_order_status': {
        const { id, status } = data
        
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
          return new Response(JSON.stringify({ error: 'Invalid status' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const { data: order, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        console.log(`Order status updated: ${id} -> ${status}`)
        return new Response(JSON.stringify({ order }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'cleanup_sold_out': {
        // Find products that have been sold out for more than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        
        const { data: soldOutProducts, error: fetchError } = await supabase
          .from('products')
          .select('id, images')
          .eq('stock', 0)
          .not('sold_out_at', 'is', null)
          .lt('sold_out_at', twentyFourHoursAgo)
        
        if (fetchError) throw fetchError
        
        if (soldOutProducts && soldOutProducts.length > 0) {
          // Delete images from storage
          for (const product of soldOutProducts) {
            if (product.images && Array.isArray(product.images)) {
              for (const imageUrl of product.images) {
                // Extract path from URL if it's a storage URL
                if (imageUrl.includes('storage/v1/object/public/media/')) {
                  const path = imageUrl.split('storage/v1/object/public/media/')[1]
                  if (path) {
                    await supabase.storage.from('media').remove([path])
                  }
                }
              }
            }
          }
          
          // Delete the products
          const productIds = soldOutProducts.map(p => p.id)
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .in('id', productIds)
          
          if (deleteError) throw deleteError
          
          console.log(`Cleaned up ${soldOutProducts.length} sold out products`)
        }
        
        return new Response(JSON.stringify({ success: true, cleaned: soldOutProducts?.length || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
