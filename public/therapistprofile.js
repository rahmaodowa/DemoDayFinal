//brings up editUserInfo forms
var edit = document.querySelector(".editInfo")
var editForm = document.querySelector('.editUserInfo')

edit.addEventListener('click', function() {
  editForm.classList.remove('hide')
  console.log("pencil")
})

var saveUserInfo = document.querySelector('.saveUserInfo')

console.log(saveUserInfo);
saveUserInfo.addEventListener('click', function() {
  console.log('test')
  const editName = document.querySelector('.editName').value
  const editNumber = document.querySelector('.editNumber').value
  const editBio = document.querySelector('.editBio').value
  const editEmail = document.querySelector('.editEmail').value
  const editLocation = document.querySelector('.editLocation').value

  console.log(editName, 'name')
  console.log(editEmail, 'email')


  fetch('saveUserInfo', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'name': editName,
        'phone': editNumber,
        'bio': editBio,
        'email': editEmail,
        'location': editLocation
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })

  editForm.classList.add('hide')
})

//cancel editUserInfo
var cancelEdit = document.querySelector('.cancelEdit')
cancelEdit.addEventListener('click', function() {
  editForm.classList.add('hide')
})
