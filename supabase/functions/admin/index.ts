import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    switch (action) {
      case 'verify_password': {
        const { password } = data
        const { data: settings, error } = await supabase
          .from('admin_settings')
          .select('password_hash')
          .single()
        
        if (error) throw error
        
        const isValid = settings.password_hash === password
        return new Response(JSON.stringify({ success: isValid }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'change_password': {
        const { oldPassword, newPassword } = data
        
        // Verify old password first
        const { data: settings, error: fetchError } = await supabase
          .from('admin_settings')
          .select('id, password_hash')
          .single()
        
        if (fetchError) throw fetchError
        
        if (settings.password_hash !== oldPassword) {
          return new Response(JSON.stringify({ success: false, error: 'incorrect old password' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Update password
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({ password_hash: newPassword })
          .eq('id', settings.id)
        
        if (updateError) throw updateError
        
        return new Response(JSON.stringify({ success: true }), {
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
            title: product.title,
            price: product.price,
            original_price: product.originalPrice || null,
            images: product.images,
            sizes: product.sizes,
            stock: product.stock,
            category: product.category,
            description: product.description || null,
            drop_id: product.dropId || null,
            is_new: product.isNew || false,
            has_fire_effect: product.hasFireEffect || false,
          })
          .select()
          .single()
        
        if (error) throw error
        return new Response(JSON.stringify({ product: newProduct }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_product': {
        const { id, updates } = data
        const dbUpdates: Record<string, unknown> = {}
        
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.price !== undefined) dbUpdates.price = updates.price
        if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice || null
        if (updates.images !== undefined) dbUpdates.images = updates.images
        if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.dropId !== undefined) dbUpdates.drop_id = updates.dropId || null
        if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew
        if (updates.hasFireEffect !== undefined) dbUpdates.has_fire_effect = updates.hasFireEffect
        
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
        return new Response(JSON.stringify({ success: true }), {
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
            name: drop.name,
            release_date: drop.releaseDate,
            lookbook_images: drop.lookbookImages || [],
            background_url: drop.backgroundUrl || null,
            background_type: drop.backgroundType || 'image',
            is_active: true,
            global_fire_effect: drop.globalFireEffect || false,
          })
          .select()
          .single()
        
        if (error) throw error
        return new Response(JSON.stringify({ drop: newDrop }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_drop': {
        const { id, updates } = data
        const dbUpdates: Record<string, unknown> = {}
        
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.releaseDate !== undefined) dbUpdates.release_date = updates.releaseDate
        if (updates.lookbookImages !== undefined) dbUpdates.lookbook_images = updates.lookbookImages
        if (updates.backgroundUrl !== undefined) dbUpdates.background_url = updates.backgroundUrl
        if (updates.backgroundType !== undefined) dbUpdates.background_type = updates.backgroundType
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
        if (updates.globalFireEffect !== undefined) dbUpdates.global_fire_effect = updates.globalFireEffect
        
        const { data: drop, error } = await supabase
          .from('drops')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
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
        const { data: order, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})