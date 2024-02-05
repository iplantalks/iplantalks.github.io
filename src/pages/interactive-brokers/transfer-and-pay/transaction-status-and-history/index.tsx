import { HeadFC } from 'gatsby'
import * as React from 'react'
import list from './list.png'
import cancelRequest from './cancel-request.png'

const TransactionStatusAndHistory = () => {
  return (
    <main>
      <div className="container py-5">
        <h1>Transaction Status & History</h1>
        <p>На цій сторінці ми можемо подивитися список уже відбувшихся та запланованих заявок.</p>
        <p>
          Ключовою є остання колонка <b>Status</b>
        </p>
        <ul>
          <li>
            <b>Pending</b> - заявка на переказ створена, але кошти ще не надійшли
          </li>
          <li>
            <b>Validating</b> - кошти надійшли, та перевіряються.
          </li>
          <li>
            <b>Available</b> - кошти успішно надійшли, перевірені, та доступні.
          </li>
        </ul>
        <p>
          <img src={list} alt="Transactions list" className="w-100" />
        </p>
        <p>
          Важливо відмітити - наявність заявки ще нічого не означае, у разі якщо ви передумали, чи будете надсилати іншу суму ми ви завжди можете видалити заявку у статусі <b>Pending</b> тим самим
          даючи системі Interactive Brokers зрозуміти, що цього переводу не буде. Заявка є лише інформуванням IB щодо ваших намірів, а не забовʼязанням чи фактом.
        </p>
        <p>
          Для видалення заявки - клікніть по ній, там у самому низу відкрившогося віконця натисніть кнопку <b>Cancel Request</b>
        </p>
        <p>
          <img src={cancelRequest} alt="Cancel Request" className="w-100" />
        </p>
        <p>
          <b>Важливо</b> розуміти, що відміна заявки на вже відправлені кошти не відмінить переказ, заявки в цьому розділу слугують лише інформуванням IB щодо наших намірів, та за для пришвидшення
          зарахувань.
        </p>
        <p>
          Перед тим як щось робити, спробуйте створити та видалити заявку, за для того щоб подивитися як це відбувається, також, в процессі переказу подивіться як змінюватиметься статус вашої заявки.
        </p>
        <p>
          Якщо ви бажаєте подивитися фактичні зарахування, слід перейти до розділу <b>Performance & Reports</b> / <b>Statements</b> де можна буде сформувати <b>Activity</b> звіт, в якому буде розділ{' '}
          <b>Deposits & Withdrawals</b>.
        </p>
      </div>
    </main>
  )
}

export default TransactionStatusAndHistory

export const Head: HeadFC = () => <title>Transaction Status & History</title>
