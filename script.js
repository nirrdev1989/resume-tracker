const onProccessElement = document.querySelector('#on-proccess-list')
const awaitListElement = document.querySelector('#await-list')
const rejectedListElement = document.querySelector('#rejected-list')
const toSendListElement = document.querySelector('#to-send-list')

const allListWrapperElements = document.querySelectorAll('.list-wrapper')
const allBtns = document.querySelectorAll('.list-btns')

let toSendObject = getLocalStorage('to-send-list')
let onProccessObject = getLocalStorage('on-proccess-list')
let awaitObject = getLocalStorage('await-list')
let rejectedObject = getLocalStorage('rejected-list')

let allActionsMap = new Map()
let moveElementsMap = new Map()
let currentListDataIdActive = null

function createId() {
   return Math.random()
}

function getLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key)) || {}
}

function setLocalStorage(key, data) {
   localStorage.setItem(key, JSON.stringify(data))
}

function displayDataOnLoad() {
   let id = createId()
   if (Object.keys(toSendObject).length === 0) {
      toSendObject[id] = {
         id: id, content: 'to send 1'
      }
   }

   allActionsMap.set('to-send-list', {
      key: 'to-send-list',
      prevKey: null,
      nextKey: 'await-list',
      html: toSendListElement,
      data: toSendObject
   })
   allActionsMap.set('await-list', {
      prevKey: 'to-send-list',
      nextKey: 'on-proccess-list',
      key: 'await-list',
      html: awaitListElement,
      data: awaitObject
   })
   allActionsMap.set('on-proccess-list', {
      prevKey: 'await-list',
      nextKey: 'rejected-list',
      key: 'on-proccess-list',
      html: onProccessElement,
      data: onProccessObject
   })
   allActionsMap.set('rejected-list', {
      prevKey: 'on-proccess-list',
      nextKey: null,
      key: 'rejected-list',
      html: rejectedListElement,
      data: rejectedObject
   })

   for (const item of allActionsMap) {
      setLocalStorage(item[0], item[1].data)
      dispayItemsOnList(item[1].html, Object.values(item[1].data))
   }

   disabledEvents(allBtns, false)
}

function dispayItemsOnList(element, array) {
   element.textContent = ''
   for (let i = 0; i < array.length; i++) {
      createItem(element, array[i].content, array[i].id)
   }
}

function createItem(container, content, id) {
   let itemElement = document.createElement('div')

   itemElement.textContent = content
   itemElement.classList.add('list-item')
   itemElement.setAttribute('onclick', `onSelectItem(event)`)
   itemElement.setAttribute('data-content', content)
   itemElement.setAttribute('title', content)
   itemElement.setAttribute('data-uniqe-id', id)
   itemElement.setAttribute('data-parentid', container.id)

   container.appendChild(itemElement)
}


function onSelectItem(event) {
   let currentListDataId = event.target.getAttribute('data-parentid')
   let currentContent = event.target.getAttribute('data-content')
   let currentItemId = event.target.getAttribute('data-uniqe-id')
   event.target.classList.toggle('active')

   if (moveElementsMap.has(currentItemId)) {
      moveElementsMap.delete(currentItemId)
   } else {
      moveElementsMap.set(currentItemId, { currentContent: currentContent, html: event.target })
   }

   currentListDataIdActive = moveElementsMap.size > 0 ? currentListDataId : null

   if (currentListDataIdActive) {
      disabledEvents(allListWrapperElements, true)
      anableEvents(allBtns, false)
   } else {
      anableEvents(allListWrapperElements)
      disabledEvents(allBtns, false)
   }
}

function moveNext(event) {
   if (moveElementsMap.size === 0) return
   let currentLstId = event.target.getAttribute('data-listId')
   let currentList = allActionsMap.get(currentLstId)
   let nextList = allActionsMap.get(currentList.nextKey)
   updateLists(currentList, nextList)
}

function movePrev(event) {
   if (moveElementsMap.size === 0) return
   let currentLstId = event.target.getAttribute('data-listId')
   let currentList = allActionsMap.get(currentLstId)
   let prevList = allActionsMap.get(currentList.prevKey)
   updateLists(currentList, prevList)
}

function deleteItems(event) {
   let currentLstId = event.target.getAttribute('data-listId')
   let currentList = allActionsMap.get(currentLstId)

   for (const item of moveElementsMap) {
      updateRemoveItems(currentList, item)
   }

   moveElementsMap.clear()
   setLocalStorage(currentList.key, currentList.data)
   anableEvents(allListWrapperElements)
}

function updateLists(currentList, updateList) {
   for (const item of moveElementsMap) {
      updateRemoveItems(currentList, item)
      updateAddItems(updateList, item)
   }

   setLocalStorage(currentList.key, currentList.data)
   setLocalStorage(updateList.key, updateList.data)

   moveElementsMap.clear()
   anableEvents(allListWrapperElements)
   disabledEvents(allBtns)
}

function updateAddItems(list, item) {
   console.log(item)
   list.data[item[0]] = {
      id: item[0],
      content: item[1].currentContent
   }
   createItem(list.html, item[1].currentContent, item[0])
}

function updateRemoveItems(list, item) {
   delete list.data[item[0]]
   item[1].html.remove()
}


function addCompanyLink() {
   const linkInput = document.querySelector('#link-company').value

   if (linkInput.trim() === '') {
      alert('Pass link')
      return
   }

   let id = createId()
   let toSendList = allActionsMap.get('to-send-list')
   toSendList.data[id] = {
      id: id,
      content: linkInput
   }

   createItem(toSendList.html, linkInput)
   setLocalStorage(toSendList.key, toSendList.data)
}

function disabledEvents(list, all) {
   for (const item of list) {
      if (all) {
         if (item.getAttribute('data-wrapperId') !== currentListDataIdActive) {
            item.classList.add('dislbled-events')
         }
      } else {
         item.classList.add('dislbled-events')
      }
   }
}

function anableEvents(list) {
   for (const item of list) {
      item.classList.remove('dislbled-events')
   }
}

displayDataOnLoad()