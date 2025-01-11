function buildChart(data) {
    const ctx = document.getElementById('myChart');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map((d) => d.name),
            datasets: [{
                label: 'Genre Count',
                data: data.map((d) => d.count),
                backgroundColor: '#ffb41191',
                borderColor: '#ffb411',
                borderWidth: 2
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function fetchAndCountGenres() {
    try {
        // Fetch genres
        const genresResponse = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en-US', options);
        const genresData = await genresResponse.json();

        // Initialize an empty array for movies
        let allMovies = [];
        let page = 1;

        // Fetch trending movies from all pages
        while (page <= 20) {
            const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${page}`, options);
            const trendingData = await trendingResponse.json();

            // If no results, break the loop
            if (!trendingData.results || trendingData.results.length === 0) {
                break;
            }

            // Add the results from this page to the allMovies array
            allMovies = allMovies.concat(trendingData.results);

            // Increment the page number to fetch the next page
            page++;
        }

        // Initialize genres array
        const genresArray = genresData.genres.map(genre => ({
            id: genre.id,
            name: genre.name,
            count: 0
        }));

        // Count the genres in the fetched movies
        allMovies.forEach(movie => {
            movie.genre_ids.forEach(genreId => {
                const genre = genresArray.find(g => g.id === genreId);
                if (genre) {
                    genre.count += 1;
                }
            });
        });

        // Sort genres by count and take top 10
        const topGenres = genresArray
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Build the chart with top genres
        buildChart(topGenres);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchAndCountGenres();

async function getSixMoviesWithTrailers() {
    try {
        let currentPage = 1;
        const moviesWithTrailers = [];

        while (moviesWithTrailers.length < 6) {
            // Fetch trending movies
            const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?language=en-US&page=${currentPage}`, options);
            const trendingData = await trendingResponse.json();

            // For each movie, fetch its video details
            for (const movie of trendingData.results) {
                if (moviesWithTrailers.length >= 6) break; // Stop if we already have 6 movies

                const videoResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`, options);
                const videoData = await videoResponse.json();

                // Find the trailer (if it exists)
                const trailer = videoData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

                // If trailer exists, add movie to the list
                if (trailer) {
                    moviesWithTrailers.push({
                        title: movie.title,  // Movie title
                        trailerUrl: `${trailer.key}`,  // Trailer URL
                    });
                }
            }

            currentPage++;
        }

        renderMovieTrailers(moviesWithTrailers);

    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

function renderMovieTrailers(movies) {

    const trailerContainer = document.getElementById('trailer'); // Parent element to append movie trailers
    movies.forEach(movie => {
        // Create the movie trailer div
        const trailerDiv = document.createElement('div');
        trailerDiv.setAttribute("data-aos", "fade-up");
        trailerDiv.classList.add('trailer-video');

        // Create the iframe element for YouTube trailer with the updated embed format
        const iframeElement = document.createElement('iframe');
        iframeElement.src = `https://www.youtube.com/embed/${movie.trailerUrl}`; // Embed YouTube trailer URL
        iframeElement.height = "400px"; // Set the title of the iframe
        iframeElement.title = `${movie.title}`; // Set the title of the iframe

        // Create the title element
        const titleElement = document.createElement('h2');
        titleElement.textContent = movie.title; // Set the movie title

        // Append iframe and title to the trailer div
        trailerDiv.appendChild(iframeElement);
        trailerDiv.appendChild(titleElement);

        // Append the trailer div to the trailer container
        trailerContainer.appendChild(trailerDiv);
    });
}

getSixMoviesWithTrailers();

async function fetchTrendingMovies() {
    try {
        const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?language=en-US`, options);
        const trendingData = await trendingResponse.json();

        renderMovies(trendingData.results);
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

function renderMovies(movies) {
    const filmContainer = document.getElementById('film-container');

    movies.forEach(movie => {
        // Create the movie component structure
        const movieBox = document.createElement('div');
        movieBox.setAttribute("data-aos", "fade-down");
        movieBox.classList.add('box');

        // Create the image container and image
        const boxImg = document.createElement('div');
        boxImg.classList.add('box-img');
        const movieImg = document.createElement('img');
        movieImg.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`; // Fetch the movie poster
        movieImg.alt = movie.title;

        // Append the image to the box-img container
        boxImg.appendChild(movieImg);

        // Create the title and release date elements
        const movieTitle = document.createElement('h2');
        movieTitle.textContent = movie.title;

        const releaseDate = document.createElement('span');
        releaseDate.textContent = movie.release_date;

        // Append the components to the movie box
        movieBox.appendChild(boxImg);
        movieBox.appendChild(movieTitle);
        movieBox.appendChild(releaseDate);

        // Append the movie box to the film container
        filmContainer.appendChild(movieBox);
    });
}

fetchTrendingMovies();

AOS.init()
