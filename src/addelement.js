const fragment = document.createDocumentFragment();

module.exports = function addElementss() {
  const a = document.createElement('a');
  a.appendChild(document.createElement('p'));
  fragment.append(
    document.createElement('img'),
    a,
    document.createElement('p'),
    document.createElement('p'),
    document.createElement('p'),
    document.createElement('p'),
  );
  return fragment;
};
