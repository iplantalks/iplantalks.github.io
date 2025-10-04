import { Heart, LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

export const Like = ({
  bank,
  vendor,
  card,
  card_currency,
  service,
  service_currency,
  method,
  likes,
}: {
  bank: string
  vendor: string
  card: string
  card_currency: string
  service: string
  service_currency: string
  method: string
  likes: number
}) => {
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    try {
      setLoading(true)
      const url = new URL('https://europe-west3-iplantalks.cloudfunctions.net/payment_systems_like')
      url.searchParams.set('bank', bank)
      url.searchParams.set('vendor', vendor)
      url.searchParams.set('card', card)
      url.searchParams.set('card_currency', card_currency)
      url.searchParams.set('service', service)
      url.searchParams.set('service_currency', service_currency)
      url.searchParams.set('method', method)
      const res = await fetch(url)
      if (res.ok) {
        alert('Дякуємо за відмітку!\n\nВаш голос враховано та буде відображено через декілька хвилин після того як обновиться кеш.')
        console.log(await res.json())
      } else {
        alert('Нажаль сталася помилка, спробуйте пізніше')
        console.warn(res.status, res.statusText, await res.json())
      }
    } catch (error) {
      console.warn(error)
      alert('Нажаль сталася помилка, спробуйте пізніше')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className='flex gap-1 text-nowrap items-center'>
        <span>{likes}</span>
        <LoaderCircle size={14} className='text-neutral-500' />
      </span>
    )
  }
  return (
    <span className='flex gap-1 text-nowrap items-center group' role="button" style={{ opacity: likes > 0 ? 1 : 0.5 }} onClick={handleLike}>
      <span>{likes}</span>
      <Heart size={14} className={likes > 0 ? 'fill-red-500 text-red-500 group-hover:scale-105' : 'fill-neutral-500 text-neutral-500 group-hover:scale-105'} />
    </span>
  )
}
