var KEY = 'AIzaSyBGQ1D3OeADQSzDSgqlE4VGQ7QKD3GFMsQ';
var challengers = {
  11: {
    name: 'John Liu',
    url: 'https://www.johnliunewyork.com/'
  },
  13: {
    name: 'Jessica Ramos',
    url: 'https://www.ramosforstatesenate.com/'
  },
  18: 'salazar',
  17: 'morris',
  20: {
    name: 'Zellnor Myrie',
    url: 'http://z4ny.com/'
  },
  23: {
    name: 'Jasmine Robinson',
    url: 'https://www.votejasirobinson.com/'
  },
  31: {
    name: 'Robert Jackson',
    url: 'http://www.voterobertjackson.com/'
  },
  34: {
    name: 'Alessandra Biaggi',
    url: 'https://www.biaggi4ny.com/'
  },
  38: {
    name: 'Julie Goldberg',
    url: 'https://juliefornysenate.com/'
  },
  53: {
    name: 'Rachel May',
    url: 'http://rachelmay.org/'
  }
};

function loading() {
  $('#loading').css('display', 'inline-block');
  $('#search').css('display', 'none');
};

function loaded() {
  $('#loading').css('display', 'none');
  $('#search').css('display', 'inline');
};

function hideAll() {
  $('#noIDC').css('display', 'none');
  $('#yesIDC').css('display', 'none');
  $('#salazar').css('display', 'none');
  $('#morris').css('display', 'none');
}

function showDistrict(district, senator) {
  var challenger = challengers[parseInt(district)];
  hideAll();
  // it's a non-IDC "custom" district
  if (typeof(challenger) === 'string') {
    $('#'+challenger).css('display', 'block');
  } else {
    var isIDC = !!challenger;
    var antiPrefix = isIDC ? '#noIDC' : '#yesIDC';
    var $antiWrapper = $(antiPrefix);
    var prefix = isIDC ? '#yesIDC' : '#noIDC';
    var $wrapper = $(prefix);
    var $district = $(prefix + 'District');
    var $senator = $(prefix + 'Senator');

    $wrapper.css('display', 'block');

    $district.text(district);
    $senator.text(senator || '{INSERT YOUR SENATOR HERE}');
    if (isIDC) {
      $challenger = $(prefix + 'Challenger');
      $challenger.attr('href', challenger.url);
      $challenger.text(challenger.name);
    }
  }

  // happens regardless of which district
  $('#moreInfo').css('display', 'block');
  $('#nextSteps').css('display', 'block');
  $('html, body').animate(
    {
      scrollTop: $('#answers').offset().top - 10,
      easing: "easeout"
    },
    600
  );
  $('#moreDistricts').attr(
    'href',
    'http://www.elections.ny.gov/district-map/district-map.html#/?address='+encodeURI($('#addr').val())
  )
};

function showError(error) {
  alert(error);
};

function getDistrict(latLng) {
  var url = 'https://cunycur.cartodb.com/api/v2/sql/?q=select%20coundist%3A%3Atext%20as%20label%2C%20%27CityCouncilDistrict%27%20as%20type%2C%20ST_Simplify%28the_geom%2C%200.00025%29%20as%20the_geom%20from%20ref_nycouncil13b%20where%20ST_Intersects%28%20the_geom%2C%20ST_SetSRID%28%27POINT%28' + latLng.lng + '%20'+ latLng.lat +'%29%27%3A%3Ageometry%20%2C%204326%29%20%29%20UNION%20select%20sdtext%20as%20label%2C%20%27NyStateSenateDistrict%27%20as%20type%2C%20ST_Simplify%28the_geom%2C%200.00048%29%20as%20the_geom%20from%20latfor_sen_march2012_forcarto%20where%20ST_Intersects%28%20the_geom%2C%20ST_SetSRID%28%27POINT%28' + latLng.lng + '%20'+ latLng.lat +'%29%27%3A%3Ageometry%20%2C%204326%29%20%29&format=geojson&_=1558925147510';
  $.ajax({
    url: url,
    success: function(data) {
      var district;
      try {
        district = data.features.filter(f => f.properties.type === 'NyStateSenateDistrict')[0].properties.label;
      }
      catch (err) {
        showError('No results found.')
        loaded();
      }
      showDistrict(district);
      loaded();
    },
    error: function(err) {
      console.log('err', err);
      loaded();
    }
  });
}

$(function() {
  $("#address").submit(function(event) {
    event.preventDefault();
    // for testing to avoid hitting the API unnecessarily
    // if ($('#addr').val() === 'no') return showDistrict('25', 'Velmanette Montgomery');
    // else return showDistrict('17', 'Simcha Felder');

    loading();
    $.ajax({
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      data: {
        key: KEY,
        address: $('#addr').val()
      },
      success: function(data) {
        try {
          var result = data.results[0];
          var formattedAddr = result.formatted_address;
          var latLng = result.geometry.location;
        }
        catch (err) {
          console.log('error!', err);
          loaded();
        }
        getDistrict(latLng);
      },
      error: function(err) {
        console.log('error!', err);
        loaded();
      }
    });
  });
});
