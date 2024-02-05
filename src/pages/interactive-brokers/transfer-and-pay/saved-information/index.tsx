import { HeadFC } from 'gatsby'
import * as React from 'react'
import list from './list.png'

const SavedInformation = () => {
  return (
    <main>
      <div className="container py-5">
        <h1>Saved Information</h1>
        <p>На цій сторінці ми можемо подивитися список збережених корреспондентів.</p>
        <p>Саме наявність будь чого тут, впливає на єкран створення заявки, також, після створення заявки, сюди зберігаються данні корреспонденту.</p>
        <p>Слід спиймати цей список як записну книжку у вашому телефоні, наявність чі відсутність записів тут не впливає на роботу системи і слугує лише вашій зручності.</p>
        <p>
          <img src={list} alt="List of correspondents" className="w-100" />
        </p>
        <p>Одночасно складність та зручність полягає у тому, що разово налаштувавши перекази, вам не потрібно буде заглядати сюди роками.</p>
        <p>Але саме через це, у разі коли знадобиться щось інше, буде дуже важко спамьятати які саме корреспонденти та з якими реквізитами потрібно створювати.</p>
        <p>У разі якщо ви створюєте свій перший платіж подивіться відповідну сторінку.</p>
      </div>
    </main>
  )
}

export default SavedInformation

export const Head: HeadFC = () => <title>Saved Information</title>
