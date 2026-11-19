const video = document.querySelector('#video');
const play = document.querySelector('#play');

function startVideo() {
  video.play().catch(() => {
    play.hidden = false;
  });
}

play.addEventListener('click', startVideo);
document.querySelector('#instruction-link').addEventListener('click', startVideo);
video.addEventListener('playing', () => {
  play.hidden = true;
});
video.addEventListener('ended', () => {
  play.hidden = false;
});
