let banner = document.querySelector("#infoBanner > div");

for (let i = 0; i < 14; i++) {
  let message = document.createElement("a");
  message.innerHTML = `<a target="_blank"
    href="https://docs.google.com/forms/d/e/1FAIpQLSf-ng--VCFdr2Srih-JI6i1EdiQneSmb6MqImTzhQoDNFC-nw/viewform"
    >Les inscriptions pour la saison 4 de l'Altered Rennes Cup sont
    ouvertes jusqu'au 1er avril 10h !</a
  >`;
  banner.appendChild(message);
}
