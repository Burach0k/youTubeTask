const fetch = require('node-fetch');
const addSomeElements = require('./addelement');

const divElements = [];
let mouseUp = false;
let url = '';
let mouseX;
let numberElementOnPages = 0;
let nextPage = '';
const listOfCircles = [];
let numberOfLoadedItems = 0;
let pageNumber = 0;
const valueList1 = 0;
const valueList2 = 1;
const valueList3 = 2;
const valueList4 = 3;
let currentTapePosition = 0;
let margin = 0;
let circleIndexOfPage = 0;

const span = document.createElement('span');
document.body.append(span);

const input = document.createElement('input');
document.body.append(input);
input.type = 'text';
input.value = '';
input.id = 'input';

const slideTape = document.createElement('div');
document.body.append(slideTape);
slideTape.classList.add('slide-tape');
slideTape.id = 'slide-tape';

const c = document.querySelector('.slide-tape');

const listbar = document.createElement('ul');
document.body.append(listbar);

/* Добавляет 15 пустых элементво в горизонтальный список */
function addElements(firstIdex, lastIndex) {
  for (let i = firstIdex; i < lastIndex; i += 1) {
    divElements[i] = document.createElement('div');
    divElements[i].classList.add('slide');
    slideTape.appendChild(divElements[i]);

    divElements[i].appendChild(addSomeElements());

    slideTape.children[i].style.minWidth = `${320}px`;
    slideTape.children[i].style.maxHeight = `${60}vh`;
    slideTape.children[i].style.marginLeft = `${margin}px`;
    slideTape.children[i].style.marginRight = `${margin}px`;
  }
}

/* Отображение номера страницы */
function circle(a, b) {
  let indexB = b;
  if (indexB === -1) indexB = 3;
  if (indexB === 4) indexB = 0;
  listOfCircles[a].innerHTML = pageNumber + 1;
  listOfCircles[a].style.width = '19px';
  listOfCircles[a].style.height = '19px';
  listOfCircles[a].style.marginTop = '5px';
  listOfCircles[a].style.backgroundColor = 'red';

  listOfCircles[indexB].style.backgroundColor = '#333d46';
  listOfCircles[indexB].style.height = '9px';
  listOfCircles[indexB].style.width = '9px';
  listOfCircles[indexB].style.marginTop = '10px';
  listOfCircles[indexB].innerHTML = '';
}

/* Обработка API запроса и отображение полученной информации */
function newSlide(firstIdex, lastIndex, q, nextToken) {
  let myNewxToken = nextToken;
  url = '';
  if (myNewxToken === undefined) myNewxToken = '';
  const promise = new Promise(((resolve) => {
    fetch(
      `https://www.googleapis.com/youtube/v3/search?key=AIzaSyCTWC75i70moJLzyNh3tt4jzCljZcRkU8Y&type=video&part=snippet&maxResults=15${
        q
      }${myNewxToken}`,
    )
      .then(response => response.json())
      .then((json) => {
        if (json.nextPageToken) nextPage = json.nextPageToken;

        for (let i = 0; i < 15; i += 1) {
          slideTape.children[i + firstIdex].children[0].src = json.items[i].snippet.thumbnails.medium.url;

          slideTape.children[i + firstIdex].children[1].children[0].innerHTML = json.items[i].snippet.title;

          slideTape.children[i + firstIdex].children[2].innerHTML = json.items[i].snippet.channelTitle;

          slideTape.children[i + firstIdex].children[3].innerHTML = json.items[i].snippet.publishedAt.substring(0, 10);

          slideTape.children[i + firstIdex].children[5].innerHTML = json.items[i].snippet.description;

          if (i !== lastIndex - 1) {
            slideTape.children[i + firstIdex].children[1].href = `https://www.youtube.com/watch?v=${json.items[i].id.videoId}`;

            url += `${json.items[i].id.videoId},`;
          } else {
            slideTape.children[i + firstIdex].children[1].href = `https://www.youtube.com/watch?v=${json.items[i].id.videoId}`;

            url += json.items[i].id.videoId;
          }
        }
        resolve(url);
      });
  }));

  promise.then((result) => {
    fetch(`https://www.googleapis.com/youtube/v3/videos?key=AIzaSyCTWC75i70moJLzyNh3tt4jzCljZcRkU8Y&id=${result}&part=snippet,statistics`)
      .then(response => response.json())
      .then((json) => {
        for (let i = 0; i < 15; i += 1) {
          slideTape.children[i + firstIdex].children[4].innerHTML = json.items[i].statistics.viewCount;
        }
      });
  });
}

/* Изменение style.margin для элементов в горизонтальном списке */
function divMargin(marg) {
  for (let i = 0; i < divElements.length; i += 1) {
    divElements[i].style.marginLeft = `${marg}px`;
    divElements[i].style.marginRight = `${marg}px`;
  }
}

/* Изменение количества клипов на странице */
function windowSize() {
  c.style.setProperty('--time', `${0}s`);
  numberElementOnPages = Math.floor(document.documentElement.clientWidth / 380);
  margin = (document.body.clientWidth - 320 * numberElementOnPages) / (numberElementOnPages * 2);
  divMargin(margin);

  c.style.setProperty('--i', `${-document.body.clientWidth * pageNumber}px`);
}

function unify(e) {
  return e.changedTouches ? e.changedTouches[0] : e;
}

/* Обработка отжатия мыши */
function up(e) {
  mouseUp = false;
  c.style.setProperty('--time', `${0.5}s`);
  c.style.setProperty('--tx', `${0}px`);
  if (mouseX - unify(e).clientX > 200) {
    pageNumber += 1;
    circleIndexOfPage += 1;
    if (circleIndexOfPage > 3) circleIndexOfPage = 0;
    circle(circleIndexOfPage, circleIndexOfPage - 1);

    currentTapePosition = -document.body.clientWidth * pageNumber;
    c.style.setProperty('--i', `${currentTapePosition}px`);

    /* Подгружает новые элементы, если ширина слайдера меньше, чем ширина окна браузера */
    if (document.documentElement.clientWidth - (divElements.length * 300 + divElements.length * 2 * margin) / (pageNumber + 2) > 0) {
      divMargin(margin);
      addElements(15 + numberOfLoadedItems, 30 + numberOfLoadedItems);
      newSlide(15 + numberOfLoadedItems, 30 + numberOfLoadedItems, `&q=${input.value}`, `&pageToken=${nextPage}`);
      numberOfLoadedItems += 15;
    }
  }
  if (mouseX - unify(e).clientX < -200) {
    pageNumber -= 1;
    if (pageNumber >= 0) {
      circleIndexOfPage -= 1;
      if (circleIndexOfPage < 0) circleIndexOfPage = 3;
      circle(circleIndexOfPage, circleIndexOfPage + 1);
    }

    if (pageNumber < 0) pageNumber = 0;
    currentTapePosition = -document.body.clientWidth * pageNumber;
    c.style.setProperty('--i', `${currentTapePosition}px`);
  }

  listbar.style.opacity = '0';
  listbar.style.setProperty('--timeopacity', `${8}s`);
}

/* Обработка движения мыши после mousedown */
function move(e) {
  if (mouseUp) {
    c.style.setProperty('--time', `${0}s`);
    c.style.setProperty('--tx', `${unify(e).clientX - mouseX}px`);
    c.style.setProperty('--n', `${-document.body.clientWidth * pageNumber}px`);
  }
}

/* Обработка нажатия мыши */
function down(e) {
  listbar.style.opacity = '1';
  listbar.style.setProperty('--timeopacity', `${0.5}s`);
  mouseX = unify(e).clientX;
  mouseUp = true;
  circle(circleIndexOfPage, circleIndexOfPage - 1);
}

/* Добавление 15 пустых элементво в горизонтальный список */
addElements(0, 15);

/* Добавление четырех кнопок для навигации */
listOfCircles[0] = document.createElement('li');
listOfCircles[1] = document.createElement('li');
listOfCircles[2] = document.createElement('li');
listOfCircles[3] = document.createElement('li');

listbar.append(
  listOfCircles[0],
  listOfCircles[1],
  listOfCircles[2],
  listOfCircles[3],
);
circle(0, 1);

/* Управление пейджингом */
listOfCircles[0].onclick = () => {
  currentTapePosition += document.body.clientWidth * (circleIndexOfPage - valueList1);
  c.style.setProperty('--i', `${currentTapePosition}px`);

  if (circleIndexOfPage > valueList1) {
    pageNumber -= circleIndexOfPage - valueList1;
  } else {
    pageNumber += valueList1 - circleIndexOfPage;
  }

  circle(0, circleIndexOfPage);
  circleIndexOfPage = 0;
};

listOfCircles[1].onclick = () => {
  currentTapePosition += document.body.clientWidth * (circleIndexOfPage - valueList2);
  c.style.setProperty('--i', `${currentTapePosition}px`);
  if (circleIndexOfPage > valueList2) {
    pageNumber -= circleIndexOfPage - valueList2;
  } else {
    pageNumber += -circleIndexOfPage + valueList2;
  }

  circle(1, circleIndexOfPage);
  circleIndexOfPage = 1;
};

listOfCircles[2].onclick = () => {
  currentTapePosition += document.body.clientWidth * (circleIndexOfPage - valueList3);
  c.style.setProperty('--i', `${currentTapePosition}px`);
  if (circleIndexOfPage > valueList3) {
    pageNumber -= circleIndexOfPage - valueList3;
  } else {
    pageNumber += -circleIndexOfPage + valueList3;
  }

  circle(2, circleIndexOfPage);
  circleIndexOfPage = 2;
};

listOfCircles[3].onclick = () => {
  currentTapePosition += document.body.clientWidth * (circleIndexOfPage - valueList4);
  c.style.setProperty('--i', `${currentTapePosition}px`);
  if (circleIndexOfPage > valueList4) {
    pageNumber -= circleIndexOfPage - valueList4;
  } else {
    pageNumber += -circleIndexOfPage + valueList4;
  }

  circle(3, circleIndexOfPage);

  circleIndexOfPage = 3;
  if (document.documentElement.clientWidth - (divElements.length * 300 + divElements.length * 2 * margin) / (pageNumber + 2) > 0) {
    windowSize();
    addElements(14 + numberOfLoadedItems, 29 + numberOfLoadedItems);
    newSlide(
      14 + numberOfLoadedItems,
      29 + numberOfLoadedItems,
      `&q=${input.value}`,
      `&pageToken=${nextPage}`,
    );
    numberOfLoadedItems += 15;
  }
};

slideTape.addEventListener('touchstart', down);
slideTape.addEventListener('touchend', up);
slideTape.addEventListener('touchmove', move);
slideTape.addEventListener('mousedown', down);
slideTape.addEventListener('mouseup', up);
slideTape.addEventListener('mousemove', move);

input.onkeydown = (e) => {
  if (e.keyCode === 13) {
    newSlide(0, 15, `&q=${input.value}`);
    if (divElements.length > 15) {
      for (let i = 15; i < divElements.length; i += 1) {
        slideTape.removeChild(divElements[i]);
      }
      divElements.length = 15;
    } else {
      slideTape.style.visibility = 'visible';
    }
    numberOfLoadedItems = 0;
    circle(0, circleIndexOfPage);
    circleIndexOfPage = 0;
    pageNumber = 0;
    windowSize();
  }
};

window.onresize = () => {
  windowSize();
};
