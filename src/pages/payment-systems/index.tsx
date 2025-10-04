import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps, navigate } from 'gatsby'
import { currency } from '../../utils/formatters'
import { VendorLogo } from './components/_banks'
import Join from '../../components/join'
import { SheetLink, useBankLinks, usePaymentSystemLinks } from './components/_links'
import { useVideoLinks } from './components/_videos'
import { parseSheetsNumber, useGoogleSheetTable } from './components/_api'
import { Feedback } from './components/_feedback'
import { Method } from './components/_method'
import { Like } from './components/_like'
import { Checkboxes, Checkboxes2 } from './components/_checkboxes'
import { ago } from '../../utils/ago'
import { Header } from '../../components/header'
import { useAuth } from '../../context/auth'
import { Currency } from './components/_currency'
import { TooltipIcon } from './components/_tooltip'
import { Bluetooth, ChevronDown, ChevronRight, CircleQuestionMark, Heart, Info, SortAsc, SortDesc, SquarePlay, TriangleAlert } from 'lucide-react'

type Row = {
  bank: string;
  vendor: string;
  card: string;
  card_currency: string;
  bank_fee: number;
  service: string;
  service_currency: string;
  method: string;
  service_fee: number;
  service_fee_static: number;
  service_fee_alert: string;
  date: Date | null;
  comment: string;
  video: string;
  likes: number;
  works: string;
  megatag: string;
  payment: number;
}

function getUniqueValues<T, K extends keyof T>(values: T[], key: K): T[K][] {
  return Array.from(new Set(values.map((v) => v[key])))
}

const CollapsibleFilter = (props: React.PropsWithChildren<{ title: string; className?: string }>) => {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <>
      <div className={props.className || 'mt-3'}>
        <div onClick={(e) => setCollapsed(!collapsed)} className="flex gap-2 items-center justify-between cursor-pointer">
          <div>
            <b>{props.title}</b>
          </div>
          <div>
            {collapsed ? <ChevronRight /> : <ChevronDown />}
          </div>
        </div>
      </div>
      {!collapsed && <div className="mt-2">{props.children}</div>}
    </>
  )
}

const PaymentSystemsPage: React.FC<PageProps> = () => {
  const telegram = typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('telegram')
  const { user } = useAuth()
  useEffect(() => {
    if (user === null && !telegram) {
      navigate('/login?redirect=' + window.location.pathname)
    }
  }, [user])
  const [transfer, setTransfer] = useState<number>(1000)
  const rows: Row[] = useGoogleSheetTable('Data!A1:Z')
    .map((row) => ({
      bank: row['bank'],
      vendor: row['vendor'],
      card: row['card'],
      card_currency: row['card_currency'],
      bank_fee: parseSheetsNumber(row['bank_fee']) || 0,
      service: row['service'],
      service_currency: row['service_currency'],
      method: row['method'],
      service_fee: parseSheetsNumber(row['service_fee']) || 0,
      service_fee_static: parseSheetsNumber(row['service_fee_static']) || 0,
      service_fee_alert: row['service_fee_alert'] || '',
      date: row['date'] ? new Date(row['date'].split('.').reverse().join('-')) : null,
      comment: row['comment'],
      video: row['video'],
      likes: parseInt(row['likes'] || '0') || 0,
      works: row['works'],
      megatag: row['megatag'],
      payment: 0,
    }))
    .filter(({ bank, vendor, card, card_currency, service, service_currency, method }) => !!bank || !!vendor || !!card || !!card_currency || !!service || !!service_currency || !!method)

  const [megatagCheckboxes, setMegatagCheckboxes] = useState<Record<string, boolean>>({})
  const [bankCheckboxes, setBankCheckboxes] = useState<Record<string, boolean>>({})
  const [serviceCheckboxes, setServiceCheckboxes] = useState<Record<string, boolean>>({})
  const [methodCheckboxes, setMethodCheckboxes] = useState<Record<string, boolean>>({})
  const [srcCurrencyCheckboxes, setSrcCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [dstCurrencyCheckboxes, setDstCurrencyCheckboxes] = useState<Record<string, boolean>>({})
  const [sortField, setSortField] = useState<keyof (typeof rows)[0]>('payment')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hideNotWorking, setHideNotWorking] = useState(true)

  const bankLinks = useBankLinks()
  const paymentSystemLinks = usePaymentSystemLinks()
  const videoLinks = useVideoLinks()

  const rowsFilteredByMegatag = useMemo(() => rows.filter((r) => !megatagCheckboxes[r.megatag]), [rows, megatagCheckboxes])

  return (
    <main>
      {/* <Hero title="Платіжні системи" subtitle="Поповнюємо Interactive Brokers ефективно" youtube="https://www.youtube.com/watch?v=23_e_wUAnPA" /> */}
      {!telegram && <Header />}

      {!telegram && <div className="bg-rainbow text-white">
        <div className="container mx-auto my-0 px-4 py-10">
          <div className="flex gap-5 items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold">Платіжні системи</h1>
              <p className="text-3xl my-5">💡 Хочеш дізнатися, як зробити міжнародний переказ з мінімальною комісією? Переглянь відео 👉</p>
              <p>
                <a className="inline-block border border-white text-white text-lg px-6 py-2 rounded hover:bg-white hover:!text-black transition font-semibold" href="https://t.me/iPlanTalksBot?start=ZGw6Mjc2NDc4">
                  Отримати безкоштовний курс
                </a>
              </p>
            </div>
            <iframe className='aspect-video' width="560" height="315" src="https://www.youtube.com/embed/8CSLdbODqPE?si=Gk27fEcfRmCoVL5u" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
        </div>
      </div>}

      <div className="bg-neutral-100">
        <div className="m-0 p-4">
          {/* <h2>Платіжні системи</h2>
          <p>Поповнюємо Interactive Brokers ефективно</p> */}

          {/* <div className="text-bg-light rounded-3 my-2 py-2 px-3">
            <CollapsibleFilter title="Питання, відповіді та відео інструкція" className="faq">
              <PaymentsFaq />
              <hr />
              <div>
                Як переказати валюту з України за кордон
                <a className="d-inline-block text-bg-danger rounded-2 ms-3 py-1 px-2 no-underline" href="https://www.youtube.com/watch?v=23_e_wUAnPA" target="_blank">
                  <i className="fa-brands fa-youtube me-2" />
                  Video tutorial
                </a>
              </div>
            </CollapsibleFilter>
          </div> */}

          {/* <CheckboxesBankServicePivot
            combos={rowsFilteredByMegatag.filter((r) => r.works === 'TRUE')}
            onChange={({ bankCheckboxes, serviceCheckboxes }: { bankCheckboxes: Record<string, boolean>; serviceCheckboxes: Record<string, boolean> }) => {
              setBankCheckboxes({ ...bankCheckboxes })
              setServiceCheckboxes({ ...serviceCheckboxes })
            }}
          /> */}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-20/100">
              <div className="bg-white rounded p-3">
                {/* TRANSFER */}
                <div>
                  <b>Отже ми хочемо перевести</b>
                </div>
                <div className='my-2'>
                  <small className="text-neutral-500">Сума переводу</small>
                </div>
                <div>
                  <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" value={transfer} onChange={(e) => setTransfer(parseFloat(e.target.value))} />
                </div>

                {/* CURRENCY */}
                <CollapsibleFilter title="Відправляємо">
                  <Checkboxes
                    names={getUniqueValues(rowsFilteredByMegatag, 'card_currency')}
                    checkboxes={srcCurrencyCheckboxes}
                    onChange={(name: string) => setSrcCurrencyCheckboxes({ ...srcCurrencyCheckboxes, [name]: !srcCurrencyCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* MEGATAG */}
                <CollapsibleFilter title="За напрямком">
                  <Checkboxes2
                    names={getUniqueValues(rows, 'megatag')}
                    checkboxes={megatagCheckboxes}
                    onChange={(name: string) => setMegatagCheckboxes({ ...megatagCheckboxes, [name]: !megatagCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* BANK */}
                <CollapsibleFilter title="Платник">
                  <div className="flex items-center justify-between">
                    <small className="text-neutral-500">Банк</small>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      onClick={() =>
                        setBankCheckboxes(getUniqueValues(rowsFilteredByMegatag, 'bank').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(bankCheckboxes).shift() }), {}))
                      }
                    >
                      усі
                    </button>
                  </div>
                  <Checkboxes2
                    names={getUniqueValues(rowsFilteredByMegatag, 'bank')}
                    checkboxes={bankCheckboxes}
                    onChange={(name: string) => setBankCheckboxes({ ...bankCheckboxes, [name]: !bankCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* SERVICE */}
                <CollapsibleFilter title="Отримувач">
                  <div className="flex items-center justify-between">
                    <small className="text-neutral-500">Закордонний банк</small>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      onClick={() =>
                        setServiceCheckboxes(getUniqueValues(rowsFilteredByMegatag, 'service').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(serviceCheckboxes).shift() }), {}))
                      }
                    >
                      усі
                    </button>
                  </div>
                  <Checkboxes2
                    names={getUniqueValues(rowsFilteredByMegatag, 'service')}
                    checkboxes={serviceCheckboxes}
                    onChange={(name: string) => setServiceCheckboxes({ ...serviceCheckboxes, [name]: !serviceCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* Method */}
                <CollapsibleFilter title="Метод">
                  <div className="flex items-center justify-between">
                    <small className="text-neutral-500">Система оплати</small>
                    <button
                      className="px-2 py-1 text-sm rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      onClick={() =>
                        setMethodCheckboxes(getUniqueValues(rowsFilteredByMegatag, 'method').reduce((acc, name) => Object.assign(acc, { [name]: !Object.values(methodCheckboxes).shift() }), {}))
                      }
                    >
                      усі
                    </button>
                  </div>
                  <Checkboxes2
                    names={getUniqueValues(rowsFilteredByMegatag, 'method')}
                    checkboxes={methodCheckboxes}
                    onChange={(name: string) => setMethodCheckboxes({ ...methodCheckboxes, [name]: !methodCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* Dest currency */}
                <CollapsibleFilter title="Отримуємо">
                  <Checkboxes
                    names={getUniqueValues(rowsFilteredByMegatag, 'service_currency')}
                    checkboxes={dstCurrencyCheckboxes}
                    onChange={(name: string) => setDstCurrencyCheckboxes({ ...dstCurrencyCheckboxes, [name]: !dstCurrencyCheckboxes[name] })}
                  />
                </CollapsibleFilter>

                {/* Hide not working */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input type="checkbox" id="hide-not-working" checked={hideNotWorking} onChange={() => setHideNotWorking(!hideNotWorking)} />
                    <label htmlFor="hide-not-working">
                      приховати не працюючі
                    </label>
                  </div>
                </div>

                {/* EOF FILTERS */}
              </div>
            </div>
            <div className="w-full md:w-80/100">
              <table className="table-auto w-full border-collapse bg-white text-sm">
                <thead className="sticky top-0 bg-neutral-200 z-10">
                  <tr className="bg-neutral-200 text-xs">
                    <th
                      onClick={() => (sortField === 'bank' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank'))}
                      className={sortField === 'bank' ? 'p-2 bg-black text-white' : 'p-2 bg-neutral-200'}
                    >
                      Платник
                      {sortField === 'bank' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'bank' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      onClick={() => (sortField === 'card_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('card_currency'))}
                      className={sortField === 'card_currency' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                    >
                      Відправляємо
                      {sortField === 'card_currency' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'card_currency' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      title="Комісія відправника"
                      onClick={() => (sortField === 'bank_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank_fee'))}
                      className={sortField === 'bank_fee' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                    >
                      Комісія <span className="text-neutral-500">%</span>
                      {sortField === 'bank_fee' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'bank_fee' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      onClick={() => (sortField === 'service' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service'))}
                      className={sortField === 'service' ? 'p-2 bg-black text-white' : 'p-2 bg-neutral-200'}
                    >
                      Отримувач
                      {sortField === 'service' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'service' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      onClick={() => (sortField === 'service_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_currency'))}
                      className={sortField === 'service_currency' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                    >
                      Отримуємо
                      {sortField === 'service_currency' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'service_currency' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      title="Комісія отримувача"
                      onClick={() => (sortField === 'service_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_fee'))}
                      className={sortField === 'service_fee' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                    >
                      Комісія <span className="text-neutral-500">%</span>
                      {sortField === 'service_fee' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'service_fee' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    <th
                      onClick={() => (sortField === 'payment' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('payment'))}
                      className={sortField === 'payment' ? 'p-2 bg-black text-white' : 'p-2 bg-neutral-200'}
                    >
                      До сплати <span className="text-neutral-500">$</span>
                      {sortField === 'payment' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                      {sortField === 'payment' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                    </th>
                    {
                        /*found*/ true && (
                        <th
                          onClick={() => (sortField === 'date' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('date'))}
                          className={sortField === 'date' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                        >
                          Перевірено
                          {sortField === 'date' && sortDirection === 'asc' && <SortDesc size={14} className='inline-block ml-2' />}
                          {sortField === 'date' && sortDirection === 'desc' && <SortAsc size={14} className='inline-block ml-2' />}
                        </th>
                      )
                    }
                    <th className="p-2 hidden md:table-cell bg-neutral-200">
                      <Info size={14} className='text-blue-500' />
                    </th>
                    {
                        /*found*/ true && (
                        <th
                          onClick={() => (sortField === 'likes' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('likes'))}
                          className={sortField === 'likes' ? 'p-2 bg-black text-white hidden md:table-cell' : 'p-2 hidden md:table-cell bg-neutral-200'}
                        >
                          Я це <Heart size={14} className='text-red-500 fill-red-500' />
                          {sortField === 'likes' && sortDirection === 'asc' && <SortAsc size={14} className='inline-block ml-2' />}
                          {sortField === 'likes' && sortDirection === 'desc' && <SortDesc size={14} className='inline-block ml-2' />}
                        </th>
                      )
                    }
                  </tr>
                </thead>
                <tbody className="border-t border-neutral-500">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-2 text-center">
                        Завантажуемо данні з Google таблички, трохи зачекайте, вона не така швидка&hellip;
                        <br />
                        Якщо сторінка довго не завантажується, спробуйте перезавантажити її.
                      </td>
                    </tr>
                  )}
                  {rows
                    .filter((r) => r.works === 'TRUE' || !hideNotWorking)
                    .filter((r) => !megatagCheckboxes[r.megatag])
                    .filter((r) => !bankCheckboxes[r.bank])
                    .filter((r) => !serviceCheckboxes[r.service])
                    .filter((r) => !methodCheckboxes[r.method])
                    .filter((r) => !srcCurrencyCheckboxes[r.card_currency])
                    .filter((r) => !dstCurrencyCheckboxes[r.service_currency])
                    .map((r) => ({ ...r, bank_links: bankLinks.find((l) => l.name === r.bank) }))
                    .map((r) => ({ ...r, service_links: paymentSystemLinks.find((l) => l.name === r.service) }))
                    .map((r) => ({
                      ...r,
                      payment: transfer + (transfer * (r.service_fee / 100) + r.service_fee_static) + (transfer + (transfer * (r.service_fee / 100) + r.service_fee_static)) * (r.bank_fee / 100),
                    }))
                    .sort((a, b) => {
                      if (sortDirection === 'asc') {
                        if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee' || sortField === 'likes') return a[sortField] - b[sortField]
                        else if (sortField === 'date') return (a[sortField]?.getTime() || 0) - (b[sortField]?.getTime() || 0)
                        return a[sortField].toString().localeCompare(b[sortField].toString())
                      } else {
                        if (sortField === 'payment' || sortField === 'bank_fee' || sortField === 'service_fee' || sortField === 'likes') return b[sortField] - a[sortField]
                        else if (sortField === 'date') return (b[sortField]?.getTime() || 0) - (a[sortField]?.getTime() || 0)
                        return b[sortField].toString().localeCompare(a[sortField].toString())
                      }
                    })
                    .map((r, i) => <Row key={i} r={r} sortField={sortField} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {!telegram && <div className="bg-neutral-100">
        <div className="container mx-auto my-0 p-4">
          <h2 className='text-2xl font-bold mb-3 flex gap-3 items-center'>
            Збираємо відгуки про маршрути! <Heart className='text-red-500' />
          </h2>
          <p className='mb-3'>
            Якщо серед них є той, яким ви користуєтеся, будь ласка, відмітьте його, натиснувши відповідну кнопку <i className="fa-solid fa-heart text-danger" />. Ми прагнемо показати найпопулярніші
            маршрути, якими користуються наші учасники.
          </p>
          <p className='mb-3'>
            Примітка: Після того, як ви проголосуєте за маршрут, має з'явитися повідомлення про успішне врахування вашого голосу. Зверніть увагу, що актуальна кількість голосів оновлюється лише кожні
            кілька хвилин. Це пов'язано з кешуванням даних у Google Sheets для оптимізації швидкості завантаження та зменшення вартості. Тому, якщо ви отримали повідомлення про зарахування голосу,
            можете бути впевнені, що ваш вибір враховано, навіть якщо зміни не відображаються відразу.
          </p>
        </div>
      </div>}

      {!telegram && <Feedback />}

      {!telegram && <div className="bg-neutral-100">
        <div className="container mx-auto my-0 p-4">
          <h2 className='text-2xl font-bold mb-3'>Корисні відео</h2>
          <p className='mb-3'>Підбірка корисних відео щодо банків та платіжних систем.</p>

          <div className="grid grid-cols-2 gap-4 my-5">
            {videoLinks.map((link, i) => (
              <div className='overflow-hidden' key={i}>
                <iframe
                  className='aspect-video w-full'
                  width="560"
                  height="315"
                  src={'https://www.youtube.com/embed/' + new URL(link.youtube).searchParams.get('v')}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
                <div className="bg-white py-2 px-4 border border-t-0 border-neutral-300">
                  <b>{link.category}</b>
                  <br />
                  {link.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {!telegram && <Join />}
    </main>
  )
}

function Row({ r, sortField }: { r: Row & { bank_links?: SheetLink, service_links?: SheetLink }; sortField: string }) {
  const telegram = typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('telegram')
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const isCollapsible = telegram || isMobile
  const [open, setOpen] = useState(false)
  return <>
    <tr className='border-t border-neutral-200' onClick={() => isCollapsible && setOpen(!open)} style={isCollapsible ? { cursor: 'pointer' } : {}}>
      <td className={sortField === 'bank' ? 'p-2 bg-neutral-100 font-bold' : 'p-2'}>
        {r.bank_links && r.bank_links.website ? (
          <a className="no-underline text-blue-500" href={r.bank_links.website} target="_blank">
            {r.bank}
          </a>
        ) : (
          <span>{r.bank}</span>
        )}
        {r.bank_links && r.bank_links.comment && (
          <TooltipIcon icon={<CircleQuestionMark size={14} className='text-black hidden md:inline-block ml-1' />} tooltip={r.bank_links.comment} />
        )}
        <div className="text-neutral-500 hidden md:block">
          <small className='flex items-center gap-1'>
            {r.vendor && <VendorLogo vendor={r.vendor} />}
            <span>{r.card}</span>
            {r.video && (
              <a className="no-underline" href={r.video} target="_blank">
                <SquarePlay size={14} className='text-red-500 inline-block' />
              </a>
            )}
            {r.bank_links && r.bank_links.remote === 'TRUE' && <TooltipIcon icon={<Bluetooth size={14} className='text-blue-500 inline-block' />} tooltip="Можливе віддаленне відкриття" />}
          </small>
        </div>
        <div className="d-block d-mhidden">
          <Currency currency={r.card_currency} /> {currency(r.bank_fee)}%
        </div>
      </td>
      <td className={sortField === 'card_currency' ? 'p-2 bg-neutral-100 font-bold hidden md:table-cell' : 'p-2 hidden md:table-cell'}><Currency currency={r.card_currency} /></td>
      <td className={sortField === 'bank_fee' ? 'p-2 bg-neutral-100 font-bold hidden md:table-cell' : 'p-2 hidden md:table-cell'}>{currency(r.bank_fee)}%</td>
      <td className={sortField === 'service' ? 'p-2 bg-neutral-100 font-bold' : 'p-2'}>
        <div className='hidden md:flex items-start gap-1'>
          {r.service_links && r.service_links.website ? (
            <a className="no-underline text-blue-500" href={r.service_links.website} target="_blank">
              {r.service}
            </a>
          ) : (
            <span>{r.service}</span>
          )}
          {r.service_links && r.service_links.comment && (
            <TooltipIcon icon={<Info size={14} className='text-blue-500 hidden md:inline-block -mt-1' />} tooltip={r.service_links.comment} />
          )}
        </div>

        <div className="text-neutral-500">
          <small>
            <Method method={r.method} />
          </small>
        </div>
        <div className="block md:hidden">
          <Currency currency={r.service_currency} /> {currency(r.service_fee)}%{r.service_fee_static > 0 && <span> + {currency(r.service_fee_static)}</span>}
        </div>
      </td>
      <td className={sortField === 'service_currency' ? 'p-2 bg-neutral-100 font-bold hidden md:table-cell' : 'p-2 hidden md:table-cell'}><Currency currency={r.service_currency} /></td>
      <td className={sortField === 'service_fee' ? 'p-2 bg-neutral-100 font-bold hidden md:table-cell' : 'p-2 hidden md:table-cell'}>
        {currency(r.service_fee)}%{r.service_fee_alert && <span title={r.service_fee_alert}><TriangleAlert className="text-orange-500 ms-2 inline-block" /></span>}
        {r.service_fee_static > 0 && (
          <div>
            <small title={'Фіксована комісія'}>+{currency(r.service_fee_static)}</small>
          </div>
        )}
      </td>
      <td className={sortField === 'payment' ? 'p-2 bg-neutral-100 font-bold' : 'p-2'}>
        {r.works === 'TRUE' ? (
          <span>{currency(r.payment)}</span>
        ) : (
          <span className="text-red-500" title="Цей маршрут не працює">
            Не працює
          </span>
        )}
      </td>
      {
                            /*found*/ true && (
          <td className={sortField === 'date' ? 'p-2 bg-neutral-100 font-bold hidden md:table-cell' : 'p-2 hidden md:table-cell'} title={r.date?.toLocaleDateString()}>
            {r.date ? ago(r.date) : <span>&mdash;</span>}
          </td>
        )
      }
      <td className="p-2 hidden md:table-cell">
        {r.comment && (
          <TooltipIcon icon={<Info size={14} className='text-blue-500 inline-block' />} tooltip={r.comment} direction='right' width={400} />
        )}
      </td>
      {
                            /*found*/ true && (
          <td className="p-2 text-end hidden md:table-cell">
            <Like {...r} />
          </td>
        )
      }
    </tr>
    {open && <tr>
      <td className='p-2' colSpan={12}>
        <div className='mb-2'>
          {r.service_links && r.service_links.website ? (
            <a className="no-underline mr-2 text-blue-500" href={r.service_links.website} target="_blank">
              {r.service}
            </a>
          ) : (
            <span className='mr-2'>{r.service}</span>
          )}
          {r.vendor && <VendorLogo vendor={r.vendor} />}
          <span className="ml-2">{r.card}</span>
        </div>
        <p className='mb-2'>{r.bank_links && r.bank_links.comment}</p>
        <p className='mb-2'>{r.service_links && r.service_links.comment}</p>
        <p>{r.comment && r.comment}</p>
      </td>
    </tr>}
  </>
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
