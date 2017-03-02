var albums = []
var this_album_details = []
var this_album_tracks = []

// After the search results are displayed, you can click through an album to show its details.

// When you want to return to the main page to start a new search, or return to the previous search results, you'll need to
// remove this information from the DOM.

function remove_clickthrough_page() {
	$("#horizontal-bar").hide()
	$("#return-search").remove()
	$("#albums li").remove()
	$("#this-title").remove()
	$("#this-artist").remove()
	$("#this-tracks").remove()
}

// Takes an array of album objects, constructs HTML to display them on the page, then inserts that HTML

function add_search_result_html(some_albums){
	$.each(some_albums, function(i, album) {

		// There is always more than one image per album.  The second image is the one that looks the best with the HTML and CSS provided

		album_art_url = album["images"][1]["url"]
		album_title = album["name"]

		// There can be more than one artist per album.  However, the first artist name can and sometimes does contain the names of multiple artists

		album_artists = album["artists"][0]["name"]
		$albums_html = $(`<li><div class="album-wrap"><a href="index.html"><img class="album-art" src="${album_art_url}"></a></div><span class="album-title">${album_title}</span><span class="album-artist">${album_artists}</span></li>`)
		$("#albums").append($albums_html)
	})
}

// The function that brings everything together.

function get_albums(some_search) {

	$.ajax({

		url: 'https://api.spotify.com/v1/search',

		data: {

			q: some_search,

			type: 'album'
		}

	}).done(function(response) {

		albums = response["albums"]["items"]

		if (albums.length > 0) {

			$("#albums li").remove()

			add_search_result_html(albums)

			bind_clickthroughs_to_album_details(albums)


		} else {

			$("#albums li").remove()

			$no_albums = $(`<li class='no-albums desc'><i class='material-icons icon-help'>help_outline</i>No albums found that match: ${some_search}.</li>`)

			$("#albums").append($no_albums)
		}
	})
}

// Event handling

// when the search form submits, remove the album details from the DOM (if any were showing), then display the new search results

$("form.search-form").on("submit", function(event) {
	event.preventDefault()
	var search_string = $("#search").val()
	remove_clickthrough_page()
	get_albums(search_string)
})

// When the user hits enter in the search form, the form submit is triggered

$("#search").keypress( function(event) {
	if (event.which == 13) {
		$("#form.search-form").submit()
	}
})

// Each album, once displayed, can be clicked through to show album details

function bind_clickthroughs_to_album_details(some_albums) {
				$("#albums a").on("click", function(event) {
					event.preventDefault()

					// which album's details to get?  It's index in the some_albums object will correspond to the anchor's parent <li>'s index in its <ul>

					this_album = some_albums[$(this).parents('li').index()]

					// a certain amount of the information is in the simplified album objects returned by the get_album's ajax query...

					this_album_art_url = this_album["images"][1]["url"]
					this_album_artists = this_album["artists"][0]["name"]
					this_album_id = this_album["id"]

					// ...however, we need another ajax request to get the full album object (which contains the release date)
					// and a separate ajax request to get the album tracks

					$.ajax({url: this_album["href"]}).done(function(response) {

						this_album_details = response
						this_album_release_date = this_album_details["release_date"].slice(0,4)

						// display the clickthrough page for the selected album, after removing the search results

						$("#albums li").remove()
						$("#horizontal-bar").show()

						$albums_html = $(`<li id="this-album"><img class="album-art" src="${this_album_art_url}"></li>`)
						$("#albums").append($albums_html)
						$(".main-header").after($(`<a href="https://open.spotify.com/album/${this_album_id}" id="this-title">${this_album["name"]} (${this_album_release_date})</a>)`))
						$("#this-title").after($(`<p id="this-artist">${this_album_artists}</p>)`))
						$("#this-artist").after($("<a href='' id='return-search'>\< return to search<a>"))

						// on that clickthrough page is a link to return to the previous search results, which should do that when clicked!

						$("#return-search").on("click", function(event) {
							event.preventDefault()
							remove_clickthrough_page()
							add_search_result_html(some_albums)
							bind_clickthroughs_to_album_details(some_albums)

						})

						// get the selected album's tracks, and display them

						$.ajax({url: 'https://api.spotify.com/v1/albums/' + this_album["id"] + '/tracks'}).done(function(response) {
					    	this_album_tracks = response["items"]
					    	tracks_html = "<ul id='this-tracks'><div>track list:</div><br><br>"
					    	$.each(this_album_tracks, function(i, track) {
					    		tracks_html += `<li>${track["track_number"]}. ${track["name"]}</li>`
					    	})
					    	tracks_html += "</ul>"
					    	$("#this-artist").after(tracks_html)
					    })
					})
				})
}

//TODO:  Adjust media query css to make the album details page look better on small screens
