const searchBox = document.querySelector('#search-term');
const searchResult = document.querySelector('#search-result');

// Make the search field focused
searchBox.focus();

searchBox.addEventListener('input', function (event) {
  search(event.target.value);
});

// Reusable "debounce" function
const debounce = (fn, delay = 500) => {
  let timeoutID;

  return (...args) => {
    // Cancel the previous timer
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    // Set up a new timer
    timeoutID = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};

// Schedule network request
const search = debounce(async searchTerm => {
  // If the search term is removed
  // reset the search result
  if (!searchTerm) {
    // Reset the search result
    searchResult.innerHTML = '';
    return;
  }

  try {
    // Make an API request
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info|extracts&inprop=url&utf8=&format=json&origin=*&srlimit=10&srsearch=${searchTerm}`;
    const response = await fetch(url);
    const searchResults = await response.json();

    // Render search result
    const searchResultHTML = generateHTML(
      searchResults.query.search,
      searchTerm
    );

    // Add the search result to the search result element
    searchResult.innerHTML = searchResultHTML;
  } catch (error) {
    console.log(error);
  }
});

// Strip HTML tags from search results
const stripHTML = html => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent;
};

// Highlight the search term
const highlight = (str, keyword, className = 'highlight') => {
  const hl = `<span class="${className}">${keyword}</span>`;
  return str.replace(new RegExp(keyword, 'gi'), hl);
};

// Convert search results to HTML
const generateHTML = (results, searchTerm) => {
  return results
    .map(result => {
      const title = highlight(stripHTML(result.title), searchTerm);
      const snippet = highlight(stripHTML(result.snippet), searchTerm);

      return `<article>
      <a href="https://em.wikipedia.org/?curid=${result.pageid}">
        <h2>${title}</h2>
      </a>
      <div class="summary">${snippet}</div>
    </article>`;
    })
    .join('');
};
