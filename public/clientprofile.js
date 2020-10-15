var addTherapist = document.querySelector('.addTherapist')
addTherapist.addEventListener('click', function() {
  const clientId = document.querySelector('.clientId').innerHTML
  const therapistId = document.querySelector('.therapistId').innerHTML
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

var trash = document.getElementsByClassName("fa fa-trash");

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('send', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
