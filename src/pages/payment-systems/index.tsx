import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { HeadFC, PageProps, navigate } from 'gatsby'
import '../../styles/common.css'
import './styles.css'
import { currency } from '../../utils/formatters'
import { VendorLogo } from './components/_banks'
import Join from '../../components/join'
import { SheetLink, useBankLinks, usePaymentSystemLinks } from './components/_links'
import { useVideoLinks } from './components/_videos'
import { parseSheetsNumber, useGoogleSheetTable } from './components/_api'
import { Feedback } from './components/_feedback'
import { Method } from './components/_method'
import { Like } from './components/_like'
import { Checkboxes, Checkboxes2, CheckboxesBankServicePivot } from './components/_checkboxes'
import { ago } from '../../utils/ago'
import { PaymentsFaq } from './components/_payments-faq'
import { Header } from '../../components/header'
import { useAuth } from '../../context/auth'
import { Currency } from './components/_currency'
import { TooltipIcon } from './components/_tooltip'

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
        <div onClick={(e) => setCollapsed(!collapsed)} className="d-flex" style={{ cursor: 'pointer' }}>
          <div className="flex-grow-1">
            <b>{props.title}</b>
          </div>
          <div className="flex-shrink-0">
            <i className={collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down'} />
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
        <div className="container py-5">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1 me-3">
              <h1 className="display-4 fw-bold mt-2">Платіжні системи</h1>
              <p className="fs-3">💡 Хочеш дізнатися, як зробити міжнародний переказ з мінімальною комісією? Переглянь відео 👉</p>
              <p>
                <a className="btn btn-outline-light btn-lg" href="https://t.me/iPlanTalksBot?start=ZGw6Mjc2NDc4">
                  Отримати безкоштовний курс
                </a>
              </p>
            </div>
            <div className="flex-shrink-0 d-none d-lg-block">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/8CSLdbODqPE?si=Gk27fEcfRmCoVL5u" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      </div>}

      <div className="bg-body-secondary">
        <div className="container-fluid py-3">
          {/* <h2>Платіжні системи</h2>
          <p>Поповнюємо Interactive Brokers ефективно</p> */}

          {/* <div className="text-bg-light rounded-3 my-2 py-2 px-3">
            <CollapsibleFilter title="Питання, відповіді та відео інструкція" className="faq">
              <PaymentsFaq />
              <hr />
              <div>
                Як переказати валюту з України за кордон
                <a className="d-inline-block text-bg-danger rounded-2 ms-3 py-1 px-2 text-decoration-none" href="https://www.youtube.com/watch?v=23_e_wUAnPA" target="_blank">
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

          <div className="row">
            <div className="col-12 col-md-3">
              <div className="text-bg-light rounded-3 my-2 py-2 px-3">
                {/* TRANSFER */}
                <div>
                  <b>Отже ми хочемо перевести</b>
                </div>
                <div>
                  <small className="text-secondary">Сума переводу</small>
                </div>
                <div>
                  <input type="number" className="form-control" value={transfer} onChange={(e) => setTransfer(parseFloat(e.target.value))} />
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
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary d-flex-growth-1">Банк</small>
                    <button
                      className="btn btn-primary btn-sm d-flex-shrink-0"
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
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary d-flex-growth-1">Закордонний банк</small>
                    <button
                      className="btn btn-primary btn-sm d-flex-shrink-0"
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
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary d-flex-growth-1">Система оплати</small>
                    <button
                      className="btn btn-primary btn-sm d-flex-shrink-0"
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
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="hide-not-working" checked={hideNotWorking} onChange={() => setHideNotWorking(!hideNotWorking)} />
                    <label className="form-check-label" htmlFor="hide-not-working">
                      приховати не працюючі
                    </label>
                  </div>
                </div>

                {/* EOF FILTERS */}
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="text-bg-light mt-2">
                <table className="table mb-0">
                  <thead className="table-header-nowrap" style={{ position: 'sticky', top: 0 }}>
                    <tr className="table-secondary  rounded-3" style={{ fontSize: '80%' }}>
                      <th
                        onClick={() => (sortField === 'bank' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank'))}
                        className={sortField === 'bank' ? 'table-dark' : ''}
                      >
                        Платник
                        {sortField === 'bank' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'bank' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'bank' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        onClick={() => (sortField === 'card_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('card_currency'))}
                        className={sortField === 'card_currency' ? 'table-dark d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}
                      >
                        Відправляємо
                        {sortField === 'card_currency' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'card_currency' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'card_currency' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        title="Комісія відправника"
                        onClick={() => (sortField === 'bank_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('bank_fee'))}
                        className={sortField === 'bank_fee' ? 'table-dark d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}
                      >
                        Комісія <span className="text-secondary">%</span>
                        {sortField === 'bank_fee' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'bank_fee' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'bank_fee' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        onClick={() => (sortField === 'service' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service'))}
                        className={sortField === 'service' ? 'table-dark' : ''}
                      >
                        Отримувач
                        {sortField === 'service' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'service' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'service' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        onClick={() => (sortField === 'service_currency' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_currency'))}
                        className={sortField === 'service_currency' ? 'table-dark d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}
                      >
                        Отримуємо
                        {sortField === 'service_currency' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'service_currency' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'service_currency' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        title="Комісія отримувача"
                        onClick={() => (sortField === 'service_fee' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('service_fee'))}
                        className={sortField === 'service_fee' ? 'table-dark d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}
                      >
                        Комісія <span className="text-secondary">%</span>
                        {sortField === 'service_fee' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'service_fee' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'service_fee' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      <th
                        onClick={() => (sortField === 'payment' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('payment'))}
                        className={sortField === 'payment' ? 'table-dark' : ''}
                      >
                        До сплати <span className="text-secondary">$</span>
                        {sortField === 'payment' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                        {sortField === 'payment' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                        {sortField !== 'payment' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                      </th>
                      {
                        /*found*/ true && (
                          <th
                            onClick={() => (sortField === 'date' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('date'))}
                            className={sortField === 'date' ? 'table-dark d-none d-md-table-cell' : 'd-none d-md-table-cell'}
                          >
                            Перевірено
                            {sortField === 'date' && sortDirection === 'asc' && <i className="fa-solid fa-sort-down ms-1" />}
                            {sortField === 'date' && sortDirection === 'desc' && <i className="fa-solid fa-sort-up ms-1" />}
                            {sortField !== 'date' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                          </th>
                        )
                      }
                      <th className="d-none d-md-table-cell">
                        <i className="text-primary fa-solid fa-circle-info" />
                      </th>
                      {
                        /*found*/ true && (
                          <th
                            onClick={() => (sortField === 'likes' ? setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc') : setSortField('likes'))}
                            className={sortField === 'likes' ? 'table-dark d-none d-md-table-cell' : 'd-none d-md-table-cell'}
                          >
                            Я це <i className="fa-solid fa-heart text-danger ms-1" />
                            {sortField === 'likes' && sortDirection === 'asc' && <i className="fa-solid fa-sort-up ms-1" />}
                            {sortField === 'likes' && sortDirection === 'desc' && <i className="fa-solid fa-sort-down ms-1" />}
                            {sortField !== 'likes' && <i className="opacity-50 text-secondary fa-solid fa-sort ms-1" />}
                          </th>
                        )
                      }
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={12} className="text-center">
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
      </div>

      {!telegram && <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>
            Збираємо відгуки про маршрути! <i className="fa-solid fa-heart text-danger" />
          </h2>
          <p>
            Якщо серед них є той, яким ви користуєтеся, будь ласка, відмітьте його, натиснувши відповідну кнопку <i className="fa-solid fa-heart text-danger" />. Ми прагнемо показати найпопулярніші
            маршрути, якими користуються наші учасники.
          </p>
          <p>
            Примітка: Після того, як ви проголосуєте за маршрут, має з'явитися повідомлення про успішне врахування вашого голосу. Зверніть увагу, що актуальна кількість голосів оновлюється лише кожні
            кілька хвилин. Це пов'язано з кешуванням даних у Google Sheets для оптимізації швидкості завантаження та зменшення вартості. Тому, якщо ви отримали повідомлення про зарахування голосу,
            можете бути впевнені, що ваш вибір враховано, навіть якщо зміни не відображаються відразу.
          </p>
        </div>
      </div>}

      {!telegram && <Feedback />}

      {!telegram && <div className="bg-body-secondary">
        <div className="container py-5">
          <h2>Корисні відео</h2>
          <p>Підбірка корисних відео щодо банків та платіжних систем.</p>

          <div className="row">
            {videoLinks.map((link, i) => (
              <div key={i} className="col-12 col-md-6 my-3">
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="ratio ratio-16x9">
                    <iframe
                      width="560"
                      height="315"
                      src={'https://www.youtube.com/embed/' + new URL(link.youtube).searchParams.get('v')}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="card-body">
                    <b>{link.category}</b>
                    <br />
                    {link.name}
                  </div>
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
    <tr onClick={() => isCollapsible && setOpen(!open)} style={isCollapsible ? { cursor: 'pointer' } : {}}>
      <td className={sortField === 'bank' ? 'table-secondary fw-bold' : ''}>
        {r.bank_links && r.bank_links.website ? (
          <a className="text-decoration-none" href={r.bank_links.website} target="_blank">
            {r.bank}
          </a>
        ) : (
          <span>{r.bank}</span>
        )}
        {r.bank_links && r.bank_links.comment && (
          <TooltipIcon className="fa-regular fa-circle-question fs-6 ms-1 d-none d-md-inline" tooltip={r.bank_links.comment} />
        )}
        <div className="text-secondary d-none d-md-block">
          <small>
            {r.vendor && <VendorLogo vendor={r.vendor} />}
            <span className="ms-2">{r.card}</span>
            {r.video && (
              <a className="text-decoration-none link-danger ms-2" href={r.video} target="_blank">
                <i className="fa-brands fa-youtube" />
              </a>
            )}
            {r.bank_links && r.bank_links.remote === 'TRUE' && <TooltipIcon className="text-primary fa-brands fa-bluetooth ms-1" tooltip="Можливе віддаленне відкриття" />}
          </small>
        </div>
        <div className="d-block d-md-none">
          <Currency currency={r.card_currency} /> {currency(r.bank_fee)}%
        </div>
      </td>
      <td className={sortField === 'card_currency' ? 'table-secondary fw-bold d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}><Currency currency={r.card_currency} /></td>
      <td className={sortField === 'bank_fee' ? 'table-secondary fw-bold d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}>{currency(r.bank_fee)}%</td>
      <td className={sortField === 'service' ? 'table-secondary fw-bold' : ''}>
        <div className='d-none d-md-block'>
          {r.service_links && r.service_links.website ? (
            <a className="text-decoration-none" href={r.service_links.website} target="_blank">
              {r.service}
            </a>
          ) : (
            <span>{r.service}</span>
          )}
        </div>
        {r.service_links && r.service_links.comment && (
          <TooltipIcon className="text-primary fa-solid fa-circle-info ms-2 d-none d-md-inline" tooltip={r.service_links.comment} />
        )}
        <div className="text-secondary">
          <small>
            <Method method={r.method} />
          </small>
        </div>
        <div className="d-block d-md-none">
          <Currency currency={r.service_currency} /> {currency(r.service_fee)}%{r.service_fee_static > 0 && <span> + {currency(r.service_fee_static)}</span>}
        </div>
      </td>
      <td className={sortField === 'service_currency' ? 'table-secondary fw-bold d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}><Currency currency={r.service_currency} /></td>
      <td className={sortField === 'service_fee' ? 'table-secondary fw-bold d-none d-sm-table-cell' : 'd-none d-sm-table-cell'}>
        {currency(r.service_fee)}%{r.service_fee_alert && <i className="text-warning ms-2 fa-solid fa-triangle-exclamation" title={r.service_fee_alert} />}
        {r.service_fee_static > 0 && (
          <div>
            <small title={'Фіксована комісія'}>+{currency(r.service_fee_static)}</small>
          </div>
        )}
      </td>
      <td className={sortField === 'payment' ? 'table-secondary fw-bold' : ''}>
        {r.works === 'TRUE' ? (
          <span>{currency(r.payment)}</span>
        ) : (
          <span className="text-danger" title="Цей маршрут не працює">
            Не працює
          </span>
        )}
      </td>
      {
                            /*found*/ true && (
          <td className={sortField === 'date' ? 'table-secondary fw-bold d-none d-md-table-cell' : 'd-none d-md-table-cell'} title={r.date?.toLocaleDateString()}>
            {r.date ? ago(r.date) : <span>&mdash;</span>}
          </td>
        )
      }
      <td className="d-none d-md-table-cell">
        {r.comment && (
          <TooltipIcon className="text-primary fa-solid fa-circle-info" tooltip={r.comment} direction='right' width={400} />
        )}
      </td>
      {
                            /*found*/ true && (
          <td className="text-end d-none d-md-table-cell">
            <Like {...r} />
          </td>
        )
      }
    </tr>
    {open && <tr>
      <td colSpan={12}>
        <div>
          {r.vendor && <VendorLogo vendor={r.vendor} />}
          <span className="ms-2">{r.card}</span>
          {r.service_links && r.service_links.website ? (
            <a className="text-decoration-none ms-2" href={r.service_links.website} target="_blank">
              {r.service}
            </a>
          ) : (
            <span className='ms-2'>{r.service}</span>
          )}
        </div>
        <p>{r.bank_links && r.bank_links.comment}</p>
        <p>{r.service_links && r.service_links.comment}</p>
        <p>{r.comment && r.comment}</p>
      </td>
    </tr>}
  </>
}

export default PaymentSystemsPage

export const Head: HeadFC = () => <title>Платіжка</title>
