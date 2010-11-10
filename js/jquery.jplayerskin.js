/**
 * jPlayerSkin - Class to handle with jplayer initialization and skin behavior
 *
 * @author BlackNRoll
 * @update J.Romero
 * @version 1.2
 * @uses jQuery 1.4.2
 * @uses jScrollPane
 * @param array myPlayList = Array of json objects. Ex.: var myPlayList = [ {artist:"",name:"",mp3:"",cover:""} ];
 * @param string container = The id of the container where the player will be build
 * @param int currentTrack (Optional)
 * @param boolean autoplay (Optional)
 * @example var skin = new jPlayerSkin( '#jplayer_container' , myPlayList );
 * 			skin.initialize();  
 */
function jPlayerSkin( container , myPlayList , currentTrack , autoplay ) {
	/**
	 * The default play item
	 * @var int
	 * @default 0
	 */
	this.playItem = 0;
	
	/**
	 * Starts automatically the player
	 * @var boolean
	 * @default false
	 */
	this.autoPlay = true;
	
	/**
	 * Stores the playlist
	 * @var array
	 */
	this.playList = new Array();
	
	/**
	 * Stores the id of the container of the player
	 * @var string
	 */
	this.playerContainer;
	
	/**
	 * Store the last used value to add an track to the playlist
	 * @var int
	 */
	this.counter = 0;
	
	/**
	 * Reference to the class itself
	 * @var object
	 */
	var thisClass = this;
	
	/**
	 * Load the parameters given in the creation of the class
	 * @throws exception
	 */
	this.loadParams = function() {
		
		//Set the playlist
		if ( myPlayList ) {
			thisClass.playList = myPlayList;
		}
		
		//Set the container
		if ( container ) {
			thisClass.playerContainer = container;
		} else {
			throw "You must give an container id to start the player.";
		}
				
		//Set the current track
		if ( currentTrack ) {
			thisClass.playItem = currentTrack;
		}
		
		//Set the autoplay
		if ( autoplay ) {
			thisClass.autoPlay = autoplay;
		}
	}
	
	/**
	 * This method starts up the jPlayer with their skin
	 * @throws exception
	 */
	this.initialize = function() {
		try {
			//Load the setup parameters
			thisClass.loadParams();
			
			//Build the basic structure of the player
			thisClass.buildPlayerHtml();
			
			//Play time and total time selectors
			var jpPlayTime = $("#jplayer_play_time");
			var jpTotalTime = $("#jplayer_total_time");
					
			//Start the plugin
			$("#jquery_jplayer")
				.jPlayer({
					swfPath:"js/jPlayer/js",
					ready: function() {
						thisClass.startPlaylist();
					},
					oggSupport: false,
					//errorAlerts: true,
					warningAlerts: true
				})
				.jPlayer("onProgressChange", 
				function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
						jpPlayTime.text($.jPlayer.convertTime(playedTime));
						jpTotalTime.text($.jPlayer.convertTime(totalTime));
				})
				.jPlayer("onSoundComplete", function() {
					thisClass.playListNext();
				});
		} catch ( e ) {
			throw e;
		}
	}
	
	/**
	 * Insert the basic html elements needed to build the player
	 */
	this.buildPlayerHtml = function() {
		var html = 	'<div id="jquery_jplayer"></div>'+
					'<div class="jp-playlist-player">'+
					'<div class="jp-interface">'+
					'<ul class="jp-controls">'+
					'<li><a href="#" id="jplayer_play" class="jp-play" tabindex="1" title="Play">play</a></li>'+
					'<li><a href="#" id="jplayer_pause" class="jp-pause" tabindex="1" title="Pause">pause</a></li>'+
					'<li><a href="#" id="jplayer_volume_min" class="jp-volume-min" tabindex="1" title="Mute On">min volume</a></li>'+
					'<li><a href="#" id="jplayer_volume_max" class="jp-volume-max" tabindex="1" title="Mute Off">max volume</a></li>'+
					'<li><a href="#" id="jplayer_previous" class="jp-previous" tabindex="1" title="Previous">previous</a></li>'+
					'<li><a href="#" id="jplayer_next" class="jp-next" tabindex="1" title="Next">next</a></li>'+
					'</ul>'+
					'<div class="jp-progress">'+
					'<div id="jplayer_load_bar" class="jp-load-bar">'+
					'<div id="jplayer_play_bar" class="jp-play-bar"></div>'+
					'</div>'+
					'</div>'+
					'<div id="jplayer_volume_bar" class="jp-volume-bar">'+
					'<div id="jplayer_volume_bar_value" class="jp-volume-bar-value"></div>'+
					'</div>'+
					'<div id="jplayer_play_time" class="jp-play-time">00:00</div>'+
					'<div id="jplayer_total_time" class="jp-total-time">00:00</div>'+
					'<div id="jplayer_track_info" class="jp-track-info"><h2>Loading...</h2><h4>none</h4><img id="jplayer_track_cover" src="images/albums/noimage.jpg" width="63" height="62" alt="cover" /></div>'+
					'</div>'+
					'<div id="jplayer_playlist" class="jp-playlist">'+
					'<table cellspacing="1" cellpadding="0" class="jp-table" id="jp_playlist_table">'+
					'<tbody></tbody>'+
					'</table>'+
					'</div>'+
					'</div>';
		
		//Set the html into the player container
		$( thisClass.playerContainer ).html( html );
				
		//Load the basic events
		thisClass.loadBasicEvents();
	}
	
	/**
	 * Create the basic events needed to the skin behave properly
	 */
	this.loadBasicEvents = function() {
		//Hide the max volume button
		$('#jplayer_volume_max').hide();
		
		//On mute hide the button and show up the max volume button
		$('#jplayer_volume_min').click(function(){
			$(this).hide();
			$('#jplayer_volume_max').show();
		});
		
		//On max volume, hide the button and show up the mute button
		$('#jplayer_volume_max').click(function(){
			$(this).hide();
			$('#jplayer_volume_min').show();
		});
		
		//On increasing the volume bar hide the max volume button and
		//show up the mute volume
		$('#jplayer_volume_bar').click(function(){
			$('#jplayer_volume_max').hide();
			$('#jplayer_volume_min').show();
		});
		
		//Start to play the previous track of the playlist
		$("#jplayer_previous").click( function() {
			thisClass.playListPrev();
			$(this).blur();
			return false;
		});
		
		//Start to play the next track of the playlist
		$("#jplayer_next").click( function() {
			thisClass.playListNext();
			$(this).blur();
			return false;
		});
	}
	
	/**
	 * General method that starts up the playlist
	 */
	this.startPlaylist = function() {
		//Check if there's tracks in the playlist
		if ( thisClass.playList.length > 0 ) {
			//Show the playlist
			thisClass.displayPlayList();
			
			//Load the current track on the player
			thisClass.playListInit( thisClass.autoPlay );
			
			//Load the effects on the playlist
			thisClass.loadTableEvents();
		}
	}
	
	/**
	 * Fill the playlist with the given tracks
	 */
	this.displayPlayList = function() {
		//Clear the playlist table
		$("#jp_playlist_table tbody").empty();
		//List all tracks on the playlist
		for ( thisClass.counter = 0; thisClass.counter < thisClass.playList.length; thisClass.counter++ ) {
			thisClass.addTrackHtml( thisClass.counter , thisClass.playList[ thisClass.counter ].artist , thisClass.playList[thisClass.counter].name );
		}
		//Load the scroll pane
		thisClass.loadScrollPane();
	}
	
	/**
	 * Add one track to the playlist.
	 * Can be used in external events to add more tracks to the player.
	 * @param json obj
	 */
	this.addTrack = function( obj ) {
		//Add the track to the playlist object
		thisClass.playList[ thisClass.counter ] = obj;
				
		//Add track to the playlist table
		thisClass.addTrackHtml( thisClass.counter , obj.artist , obj.name );
		
		//If it's the first track, start the playlist
		if ( thisClass.counter == 0 ) {
			//thisClass.startPlaylist();
		}
		
		//Increase the counter of tracks
		thisClass.counter++;
	}
	
	/**
	 * Remove one track from the playlist array
	 * @param object obj
	 */
	this.removeTrack = function( obj ) {
		//Get the track index
		var index = thisClass.getTrackIndex( obj.attr('id') );
		
		//Remove track from playlist table
		obj.remove();
		
		//Remove the given index from the array
		delete thisClass.playList[index];
		
		//If it was the last element, decrease the counter
		if ( index == (thisClass.counter - 1) ) {
			thisClass.counter--;
		}
		
		//Reset the counter if no track where found
		if ( thisClass.playList.length <= 0 ) {
			thisClass.counter = 0;
		}
	}
	
	/**
	 * Return the index of the track based on his id
	 * @param string objId
	 * @return int The index of the track
	 */
	this.getTrackIndex = function( objId ) {
		return objId.replace(/jplayer_playlist_item_/,'');
	}
	
	/**
	 * Add one track to the playlist
	 * @param int index
	 * @param string artist
	 * @param string name
	 */
	this.addTrackHtml = function( index , artist , name ) {
		//If there's no artist name
		if ( !artist ) {
			artist = 'unknown';
		}
		
		//If there's no track name
		if ( !name ) {
			name = 'Track ' + index;
		}
		
		var html = '<tr id="jplayer_playlist_item_'+index+'">' +
				   '<td class="jp-table-track"><div>'+ (index+1) +'</div></td>' +
				   '<td class="jp-table-artist"><div>'+ artist +'</div></td>' +
				   '<td class="jp-table-name"><div>'+ name +'</div></td>' +
				   '<td class="jp-table-remove"><a href="#">-</a></td>' +
				   '</tr>';
		
		//Append track to the playlist
		$("#jp_playlist_table tbody").append(html);
		
		//OnClick event
		$("#jplayer_playlist_item_"+index).data( "index", index ).click( function() {
			var index = $(this).data("index");
			if (thisClass.playItem != index) {
				thisClass.playListChange( index );
			} else {
				$("#jquery_jplayer").jPlayer("play");
			}
			$(this).blur();
			return false;
		});
		
		//Load the effects on the playlist
		thisClass.loadTableEvents();		
	}
	
	/**
	 * Set the current track that will be played on load or on play
	 * @param boolean autoplay
	 */
	this.playListInit = function( autoplay ) {
		if ( autoplay ) {
			thisClass.playListChange( thisClass.playItem );
		} else {
			thisClass.playListConfig( thisClass.playItem );
		}
	}
	
	/**
	 * Configure the playlist setting the current track on the playlist and on the player
	 * @param int index
	 */
	this.playListConfig = function( index ) {
		//Set the current track class
		$("#jplayer_playlist_item_"+thisClass.playItem).removeClass("jplayer_playlist_current");
		$("#jplayer_playlist_item_"+index).addClass("jplayer_playlist_current");
		
		//Turn off hover over the current track
		thisClass.tableHoverOff( $("#jplayer_playlist_item_"+thisClass.playItem) );
		thisClass.tableHoverOff( $("#jplayer_playlist_item_"+index) );
		
		//Set the current item
		thisClass.playItem = index;
		
		
		//Set the track on the player, just set the ogg file if it exist
		if (typeof(thisClass.playList[thisClass.playItem].ogg) != 'undefined') {
			$("#jquery_jplayer").jPlayer( "setFile", thisClass.playList[thisClass.playItem].mp3 , thisClass.playList[thisClass.playItem].ogg );
		} else {
			$("#jquery_jplayer").jPlayer("setFile", thisClass.playList[thisClass.playItem].mp3);
		}
		
		//Show the track info
		thisClass.showTrackInfo( index );
	}
	
	/**
	 * Change the current track and play it
	 * @param int index
	 */
	this.playListChange = function( index ) {
		//Set the current track
		thisClass.playListConfig( index );
		
		//Start to play music
		$("#jquery_jplayer").jPlayer("play");
		
		//Show the track's info
		thisClass.showTrackInfo( index );
	}
	
	/**
	 * Plays the next track in the playlist
	 */
	this.playListNext = function() {
		//Get the next track
		var index = (thisClass.playItem+1 < thisClass.playList.length) ? thisClass.playItem+1 : 0;
		
		//Play the track
		thisClass.playListChange( index );
	}
	
	/**
	 * Plays the previous track in the playlist
	 */
	this.playListPrev = function() {
		//Get the previous track
		var index = (thisClass.playItem-1 >= 0) ? thisClass.playItem-1 : thisClass.playList.length-1;
		
		//Play the track
		thisClass.playListChange( index );
	}
	
	/**
	 * Display the track's info on the player
	 * @param int index
	 */
	this.showTrackInfo = function( index ) {
		//Variables declaration
		var name 	= '';
		var cover 	= '';
		var artist 	= '';
		
		//Check if there's a track name
		if ( thisClass.playList[ index ].name ) {
			name = thisClass.playList[ index ].name;
		} else {
			name = 'Track ' + index;
		}
		
		//Check if there's a track artist
		if ( thisClass.playList[ index ].artist ) {
			artist = thisClass.playList[ index ].artist;
		} else {
			artist = 'unknown';
		}
		
		//Check if there's a track artist
		if ( thisClass.playList[ index ].cover ) {
			cover = thisClass.playList[ index ].cover;
		} else {
			cover = "skin/img/cover.png";
		}
	
		//Set the track's title and artist
		var html = '<h2>' + name + '</h2><h4>' + artist + '</h4>' +
				   '<img id="jplayer_track_cover" src="' + cover + '" width="63" height="62" alt="cover" />';
		
		//Show the info
		$('#jplayer_track_info').html( html );
	}
	
	/**
	 * Loads the scrollpane of the tracklist table
	 */
	this.loadScrollPane = function() {
		try{
			$('#jplayer_playlist').jScrollPane({showArrows: true,autoReinitialise:true});
		}catch(e){
			$("#jquery_jplayer").jPlayer("play");
		};
	}
	
	/**
	 * Set the scroll panel items with the larger width, used without scroll bar
	 */
	this.largerScrollPaneWidth = function() {
		$('#jplayer_playlist #jplayer_scroll_panel').width(345);
		$('#jplayer_playlist .jScrollPaneContainer').width(345);
		$('.jp-table .jp-table-name,.jp-table .jp-table-name-hover,.jp-table .jplayer_playlist_current .jp-table-name').width(181);
	}
	
	/**
	 * Set the scroll panel items with the shorter width, used with the scroll bar
	 */
	this.shorterScrollPaneWidth = function() {
		$('#jplayer_playlist #jplayer_scroll_panel').width(335);
		$('#jplayer_playlist .jScrollPaneContainer').width(340);
		$('.jp-table .jp-table-name,.jp-table .jp-table-name-hover,.jp-table .jplayer_playlist_current .jp-table-name').width(161);
	}
	
	/**
	 * Activate the hover on one line of the table
	 * @param object e
	 */
	this.tableHoverOn = function( e ) {
		e.children('.jp-table-track').removeClass('jp-table-track').addClass('jp-table-track-hover');
		e.children('.jp-table-artist').removeClass('jp-table-artist').addClass('jp-table-artist-hover');
		e.children('.jp-table-name').removeClass('jp-table-name').addClass('jp-table-name-hover');
		e.children('.jp-table-remove').removeClass('jp-table-remove').addClass('jp-table-remove-hover');
	}
	
	/**
	 * Deactivate the hover on one line of the table
	 * @param object e
	 */
	this.tableHoverOff = function( e ) {
		e.children('.jp-table-track-hover').removeClass('jp-table-track-hover').addClass('jp-table-track');
		e.children('.jp-table-artist-hover').removeClass('jp-table-artist-hover').addClass('jp-table-artist');
		e.children('.jp-table-name-hover').removeClass('jp-table-name-hover').addClass('jp-table-name');
		e.children('.jp-table-remove-hover').removeClass('jp-table-remove-hover').addClass('jp-table-remove');
	}
	
	/**
	 * Load the events of the playlist table
	 */
	this.loadTableEvents = function() {
		//Activate hover on mouseOver
		$('.jp-table tr')
			.unbind('mouseout')
			.mouseover(function() {
				if ( $(this).attr('class') != "jplayer_playlist_current" ) {
					thisClass.tableHoverOn( $(this) );
				}
			});
		
		//Deactivate hover on mouseOut
		$('.jp-table tr')
			.unbind('mouseout')
			.mouseout(function() {
				if ( $(this).attr('class') != "jplayer_playlist_current" ) {
					thisClass.tableHoverOff( $(this) );
				}
			});
		
		//Remove the track from the playlist table only
		$('.jp-table-remove')
			.unbind('click')
			.click(function() {
				thisClass.removeTrack( $(this).parent() );
			});
	}
}