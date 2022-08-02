import { loadMicroApp } from '../../es';

let app, loadList = [];

function mount() {
  app = loadMicroApp(
    { name: 'react15', entry: '//localhost:7102', container: '#react15' },
    { sandbox: { experimentalStyleIsolation: true } },
  );

}

function unmount() {
  app.unmount();


}
function bindmount() {
  let name = this.getAttribute('data-name');
  let type = this.getAttribute('data-type');
  let local = this.getAttribute('data-local');
  let appobj = { name, type, local };
  let checkedList = loadList.filter(element => {
    return element.name == name
  })
  console.log(checkedList.length);
  if (checkedList.length == 0 || loadList.length == 0) {
    loadList.push(appobj);
    loadMicroApp(
      { name: name, entry: `//localhost:${local}`, container: `#${name}` },
      { sandbox: { experimentalStyleIsolation: true } }
    )
  }
  const container = document.getElementById('container').getElementsByClassName('navcontainer');
  const divList = Array.prototype.slice.call(container);
  divList.forEach(item => {
    if (item.id != name) {
      item.style.display = 'none'
    } else {
      item.style.display = 'block'
    }
  })

}
// document.querySelector('#mount').addEventListener('click', mount);
// document.querySelector('#unmount').addEventListener('click', unmount);
const li = document.getElementsByTagName('li');
const liList = Array.prototype.slice.call(li)
liList.forEach(element => {
  element.addEventListener('click', bindmount)
});

// loadMicroApp({ name: 'vue', entry: '//localhost:7101', container: '#vue' },{ sandbox: { experimentalStyleIsolation: true } });
// loadMicroApp( { name: 'html', entry: '//localhost:7104/', container: '#html' },{ sandbox: { experimentalStyleIsolation: true } });