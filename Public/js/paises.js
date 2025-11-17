const paisopcion = document.getElementById('paisNacimiento');

fetch('https://restcountries.com/v3.1/all?fields=name')
  .then(response => response.json())
  .then(countries => {

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    countries.forEach(country => {

      const option = document.createElement('option');
      option.value = country.name.common;
      option.textContent = country.name.common; 
      paisopcion.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching posts:', error));


const paises = document.getElementById('post-country');

fetch('https://restcountries.com/v3.1/all?fields=name')
  .then(response => response.json())
  .then(countries => {
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.textContent = country.name.common; 
      paises.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching posts:', error));



const nacionalidadopcion = document.getElementById('nacionalidad');

fetch('https://restcountries.com/v3.1/all?fields=name,demonyms')
  .then(response => response.json())
  .then(nacionalidad => {
    nacionalidad.sort((a, b) => a.name.common.localeCompare(b.name.common));

    nacionalidad.forEach(country => {
      let demonym = '';
      if (country.demonyms && country.demonyms.spa && country.demonyms.spa.m) {
        demonym = country.demonyms.spa.m;
      } else if (country.demonyms && country.demonyms.eng && country.demonyms.eng.m) {
        demonym = country.demonyms.eng.m;
      } else {
        demonym = country.name.common;
      }

      const option = document.createElement('option');
      option.value = demonym;
      option.textContent = demonym;
      nacionalidadopcion.appendChild(option);
    });
  })
  .catch(error => console.error('Error fetching demonyms:', error));

const editPaisSelect = document.getElementById('edit-pais');
if (editPaisSelect) {
  fetch('https://restcountries.com/v3.1/all?fields=name')
    .then(response => response.json())
    .then(countries => {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name.common;
        option.textContent = country.name.common;
        editPaisSelect.appendChild(option);
      });
    });
}

const editNacionalidadSelect = document.getElementById('edit-nacionalidad');
if (editNacionalidadSelect) {
  fetch('https://restcountries.com/v3.1/all?fields=name,demonyms')
    .then(response => response.json())
    .then(countries => {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      countries.forEach(country => {
        let demonym = '';
        if (country.demonyms && country.demonyms.spa && country.demonyms.spa.m) {
          demonym = country.demonyms.spa.m;
        } else if (country.demonyms && country.demonyms.eng && country.demonyms.eng.m) {
          demonym = country.demonyms.eng.m;
        } else {
          demonym = country.name.common;
        }
        const option = document.createElement('option');
        option.value = demonym;
        option.textContent = demonym;
        editNacionalidadSelect.appendChild(option);
      });
    });
}