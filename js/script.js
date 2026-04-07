// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

const fetchBtn = document.querySelector('button');
const gallery = document.getElementById('gallery');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// These are facts generated from AI (I am not Neil DeGrasse Tyson). I would use a api for from NASA for this but i couldn't find one about space facts.

const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin 600 times per second.",
  "The Milky Way is about 100,000 light-years across.",
  "There are more stars in the universe than grains of sand on Earth.",
  "One million Earths could fit inside the Sun.",
  "The footprints on the Moon will last millions of years — there's no wind to erase them.",
  "Saturn's rings are only about 30 feet thick in places.",
  "Voyager 1 is now over 23 billion kilometers from Earth.",
  "A teaspoon of a neutron star would weigh about 10 million tons.",
  "Light from the Sun takes about 8 minutes to reach Earth."
];

const factBox = document.getElementById('fact-box');
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
factBox.textContent = `Did you know? ${randomFact}`;

fetchBtn.addEventListener('click', fetchImages);

async function fetchImages() {
  const start = startInput.value;
  const end = endInput.value;
  // console.log(`Fetching images from ${start} to ${end}...`); works

  gallery.innerHTML = `<div class="Loading">Loading space photos...</div>`;

  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${start}&end_date=${end}`;


  const response = await fetch(url);
  const data = await response.json();
  renderGallery(data);
}

// added video support to the gallery
function renderGallery(items) {
  gallery.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';


  if (item.media_type === 'video') {
    const videoId = item.url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId[1]}/hqdefault.jpg` : null;

    card.innerHTML = `
      <div style="position:relative; height:200px; background:#000; border-radius:4px; overflow:hidden;">
        ${thumbUrl ? `<img src="${thumbUrl}" style="width:100%; height:200px; object-fit:cover;" />` : ''}
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.7); border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center; font-size:24px; color:white;">▶</div>
      </div>
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
  } else {
    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" />
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;
  }

    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  })
}

// I had to ask AI/Copilot to help me embed the video however the site refused to play the video in the modal. It turns out that the videos 

function openModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  const existingPreview = document.querySelector('.video-preview');
  if (existingPreview) {
    existingPreview.remove();
  }
  const existingLink = document.querySelector('.video-link');
  if (existingLink) {
    existingLink.remove();
  }

  if (item.media_type === 'video') {
    modalImg.classList.add('hidden');
    modalImg.src = '';

    const videoId = item.url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    // console.log('video url:', item.url);
    // console.log('videoId match:', videoId);

    if (videoId) {
      const thumbUrl = `https://img.youtube.com/vi/${videoId[1]}/hqdefault.jpg`;
      const preview = document.createElement('a');
      preview.href = item.url;
      preview.target = '_blank';
      preview.className = 'video-preview';
      preview.innerHTML = `
        <div style="position:relative; margin-bottom:16px;">
          <img src="${thumbUrl}" style="width:100%; border-radius:6px;" />
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.7); border-radius:50%; width:70px; height:70px; display:flex; align-items:center; justify-content:center; font-size:30px; color:white;">▶</div>
        </div>
      `;
      document.querySelector('.modal-content').prepend(preview);
    } else if (item.url.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = item.url;
        video.controls = true;
        video.style.width = '100%';
        video.style.borderRadius = '6px';
        video.style.marginBottom = '16px';
        video.className = 'video-preview';
        document.querySelector('.modal-content').prepend(video);
    } else {
        const videoLink = document.createElement('a');
        videoLink.href = item.url;
        videoLink.target = '_blank';
        videoLink.className = 'video-link';
        videoLink.textContent = '▶ Watch Video';
        videoLink.style.display = 'block';
        videoLink.style.marginBottom = '16px';
        videoLink.style.fontSize = '16px';
        videoLink.style.color = '#0b3d91';
        document.querySelector('.modal-content').prepend(videoLink);
    }

  } else {
    modalImg.classList.remove('hidden');
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  modalImg.src = '';
}

modal.addEventListener('click', e => {
  if (e.target === modal) {
    closeModal();
  }
});

modalClose.addEventListener('click', closeModal);

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
