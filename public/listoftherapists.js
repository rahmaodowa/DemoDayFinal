
console.log("Hello")
var addTherapist = document.querySelectorAll('.addTherapist')
Array.from(addTherapist).forEach(function(element) {
element.addEventListener('click', function() {
  const clientId = document.querySelector('.clientId').innerHTML
  const therapistId = this.parentNode.childNodes[1].innerHTML
  const currentTherapistId = document.querySelector('.currentTherapistId').innerHTML
  console.log(clientId, therapistId)
  fetch('addTherapist', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'clientId': clientId,
      'therapistId': therapistId
    })
  })
  .then(response => {
    if (response.ok) return response.json()
  })
  .then(data => {
    console.log(data)
  })
  fetch('deleteClient', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'clientId': clientId,
      'currentTherapistId': currentTherapistId
    })
  })
  .then(response => {
    if (response.ok) return response.json()
  })
  .then(data => {
    console.log(data)
  })
  fetch('addClient', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'clientId': clientId,
      'therapistId': therapistId
    })
  })
  .then(response => {
    if (response.ok) return response.json()
  })
  .then(data => {
    console.log(data)
    window.location.reload(true)
  })
})
})
