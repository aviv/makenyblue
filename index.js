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
  // 17 = simcha felder vs. blake morris
  18: 'salazar',
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
    $senator.text(senator);
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
  var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20DISTRICT%2C%20REP_NAME%2C%20REP_URL%2C%20POPULATION%20%20%20FROM%201KfhMo_HSAp3kq5Yayca22HrIhEjJLa_c_s6jd2Q%20%20WHERE%20geometry%20not%20equal%20to%20%27%27%20AND%20ST_INTERSECTS(geometry%2C%20CIRCLE(LATLNG('+latLng.lat+'%2C%20'+latLng.lng+')%2C1))&key=AIzaSyAr9svn9vdE60i2RQ6aPs7M-Bzr1qcjqDE';
  $.ajax({
    url: url,
    success: function(data) {
      try {
        var result = data.rows[0];
        var district = result[0];
        var senator = result[1];
      }
      catch (err) {
        showError('No results found.')
        loaded();
      }
      showDistrict(result[0], result[1]);
      loaded();
    },
    error: function(err) {
      console.log('err', err);
      loaded();
    }
  });
}

$("#address").submit(function(event) {
  event.preventDefault();
  // for testing to avoid hitting the API unnecessarily
  // if ($('#addr').val() === 'no') return showDistrict('25', 'Velmanette Montgomery');
  // else return showDistrict('20', 'Jesse Hamilton');

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
