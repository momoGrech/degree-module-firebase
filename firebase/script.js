const firebaseConfig = {
    apiKey: "AIzaSyAYrnPNgZ-OBZTnbrKWcZn9vh-ZzqE7pJY",
    authDomain: "movie-review-80e8a.firebaseapp.com",
    projectId: "movie-review-80e8a",
    storageBucket: "movie-review-80e8a.appspot.com",
    messagingSenderId: "999301359981",
    appId: "1:999301359981:web:0b68e3ba39b56960675264",
    measurementId: "G-ZPW3KR48T8"
};

//convert date format to yyyy-MM-dd
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var pen = '<i class="fa-solid fa-pencil pencil_edit"></i>';
var trash = '<i class="fa-solid fa-xmark trash_icon"></i>';

dataControler = 0;

function mainSorting(param_sort){

    // Get a live data snapshot (i.e. auto-refresh) of our Reviews collection
    param_sort.onSnapshot((querySnapshot) => {

        // Empty HTML table
        $('#reviewList').empty();

        // Loop through snapshot data and add to HTML table
        querySnapshot.forEach((doc) => {
            var date = doc.data().release_date.toDate().toDateString()
            
            window.container = doc.id;

            $('#reviewList').append('<tr id="table_tr">');
            $('#reviewList').append('<td>'  + doc.data().movie_name + '</td>');
            $('#reviewList').append('<td>'  + doc.data().director_name + '</td>');
            $('#reviewList').append('<td>'  + date + '</td>');
            $('#reviewList').append('<td>'  + doc.data().rating + '/5</td>');
            $('#reviewList').append('<td>'+ pen +'</td>');
            $('#reviewList').append('<td>'+ trash +'</td>');
            $('#reviewList').append('</tr>');

            // Delete data
            $(".trash_icon").on('click', function(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();

                var director = $("#author").val();
                if(director){
                    alert("Please note that deletion functionality is disabled during data modification.");
                }else{
                    $("#movie_name").val('');
                    var test = $("#author").val();
                    console.log(test);
                    let box = document.createElement('div');
                    box.setAttribute("data-id", doc.id);

                    var doc_id = box.getAttribute("data-id");

                    db.collection("Reviews").doc(doc_id).delete().then(() => {
                        console.log("Document successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing document: ", error);
                    });
                }
            });

            //Update data (populate)
            $(".pencil_edit").on('click', function(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();

                var director = $("#author").val();
                if(director){
                    alert("Please complete the pending review prior to updating to the next one.");
                }else{
                    var date = doc.data().release_date.toDate().toDateString();

                    date = formatDate(date);

                    $('#movie_name').val(doc.data().movie_name);
                    $('#author').val(doc.data().director_name);
                    $('#release_date').val(date);
                    $('#rating_score').val(doc.data().rating);     
                    $('#updateButton').css("display","block");

                    var movie_name, release_date, author, rating;
                    re_id = doc.id;
                    movie_name = doc.data().movie_name;
                    release_date = date;
                    author = doc.data().director_name
                    rating = doc.data().rating;

                    updateReview();
                }
            });
        });

        //Update data (Update database)
        function updateReview(){
            $("#updateButton").on('click', function(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                event.preventDefault();

                var temp_date = new Date($('#release_date').val());
                db.collection("Reviews").doc(re_id).update({
                    "movie_name": $("#movie_name").val(),
                    "director_name": $("#author").val(),
                    "rating": parseInt($("#rating_score").val()),
                    "release_date": temp_date
                });
                $('#updateButton').css("display","none");
                $("#movie_name").val('');
                $("#author").val('');
                $("#release_date").val('');
                $("#rating_score").val('');
            });
        }

        // Add button pressed
        $("#addButton").click(function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            var temp_date = new Date($('#release_date').val());

            var movie = $("#movie_name").val();
            var director = $("#author").val();
            var rate = $("#rating_score").val();

            movie = movie.trim();
            director = director.trim();

            if(!movie){
                alert("Please insert a movie name");
            }else if(!director){
                alert("Please insert a Director name");
            }else if(temp_date == "Invalid Date"){
                alert("Please insert a Release date");
            }else if(!rate){
                alert("Please insert a rating score");
            }else{
                // Add review to Firestore collection
                db.collection("Reviews").add({
                    director_name: director,
                    movie_name: movie,
                    rating: parseInt(rate),
                    release_date: temp_date
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });			
                
                // Reset form
                $("#movie_name").val('');
                $("#author").val('');
                $("#rating_score").val('');
            }
        });
    });
}

// Get a live data snapshot (i.e. auto-refresh) of our Reviews collection
db.collection("Reviews").onSnapshot((querySnapshot) => {

    // Empty HTML table
    $('#reviewList').empty();

    // Loop through snapshot data and add to HTML table
    querySnapshot.forEach((doc) => {
        var date = doc.data().release_date.toDate().toDateString()
        
        window.container = doc.id;

        if(dataControler == 0){
            $('#reviewList').append('<tr id="table_tr">');
            $('#reviewList').append('<td>'  + doc.data().movie_name + '</td>');
            $('#reviewList').append('<td>'  + doc.data().director_name + '</td>');
            $('#reviewList').append('<td>'  + date + '</td>');
            $('#reviewList').append('<td>'  + doc.data().rating + '/5</td>');
            $('#reviewList').append('<td>'+ pen +'</td>');
            $('#reviewList').append('<td>'+ trash +'</td>');
            $('#reviewList').append('</tr>');
        }
        else{
            $('#reviewList').empty();
        }

        // click buttons to sort (movie - ascending order)
        $("#movie_asen").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_asc = db.collection("Reviews").orderBy("movie_name", "asc");
            mainSorting(movie_asc);
            
            dataControler = 1;
        });

        // click buttons to sort (movie - descending order)
        $("#movie_desc").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_desc = db.collection("Reviews").orderBy("movie_name", "desc");
            mainSorting(movie_desc);

            dataControler = 1;
        });

        // click buttons to sort (Director - ascending order)
        $("#director_asen").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_asc = db.collection("Reviews").orderBy("director_name", "asc");
            mainSorting(movie_asc);
            
            dataControler = 1;
        });

        // click buttons to sort (Director - descending order)
        $("#director_desc").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_desc = db.collection("Reviews").orderBy("director_name", "desc");
            mainSorting(movie_desc);

            dataControler = 1;
        });

        // click buttons to sort (Release - date ascending order)
        $("#releaseDate_asen").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_asc = db.collection("Reviews").orderBy("release_date", "asc");
            mainSorting(movie_asc);
            
            dataControler = 1;
        });

        // click buttons to sort (Release date - descending order)
        $("#releaseDate_desc").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_desc = db.collection("Reviews").orderBy("release_date", "desc");
            mainSorting(movie_desc);

            dataControler = 1;
        });

        // click buttons to sort (Rating - ascending order)
        $("#rating_asen").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_asc = db.collection("Reviews").orderBy("rating", "asc");
            mainSorting(movie_asc);
            
            dataControler = 1;
        });

        // click buttons to sort (Rating - descending order)
        $("#rating_desc").on('click', function(event){
            event.stopPropagation();
            event.stopImmediatePropagation();

            var movie_desc = db.collection("Reviews").orderBy("rating", "desc");
            mainSorting(movie_desc);

            dataControler = 1;
        });
        
        // Delete data
        $(".trash_icon").on('click', function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();

            var director = $("#author").val();
            if(director){
                alert("Please note that deletion functionality is disabled during data modification.");
            }else{
                let box = document.createElement('div');
                box.setAttribute("data-id", doc.id);
    
                var doc_id = box.getAttribute("data-id");
    
                db.collection("Reviews").doc(doc_id).delete().then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });
            }
        });

        //Update data (populate)
        $(".pencil_edit").on('click', function(event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            var director = $("#author").val();
            if(director){
                alert("Please complete the pending review prior to updating to the next one.");
            }else{
                var date = doc.data().release_date.toDate().toDateString();

                date = formatDate(date);

                $('#movie_name').val(doc.data().movie_name);
                $('#author').val(doc.data().director_name);
                $('#release_date').val(date);
                $('#rating_score').val(doc.data().rating);       
                $('#updateButton').css("display","block");

                var movie_name, release_date, author, rating;
                re_id = doc.id;
                movie_name = doc.data().movie_name;
                release_date = date;
                author = doc.data().director_name
                rating = doc.data().rating;

                //call function
                updateReview();
            }
        });
    });

    //Update data (Update database)
    function updateReview(){
        $("#updateButton").on('click', function(event) {
            
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();

            var temp_date = new Date($('#release_date').val());
            db.collection("Reviews").doc(re_id).update({
                "movie_name": $("#movie_name").val(),
                "director_name": $("#author").val(),
                "rating": parseInt($("#rating_score").val()),
                "release_date": temp_date
            });
            $('#updateButton').css("display","none");
            $("#movie_name").val('');
            $("#author").val('');
            $("#release_date").val('');
            $("#rating_score").val('');
        });
    }

    // Add button pressed
    $("#addButton").click(function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        var temp_date = new Date($('#release_date').val());

        var movie = $("#movie_name").val();
        var director = $("#author").val();
        var rate = $("#rating_score").val();

        movie = movie.trim();
        director = director.trim();

        if(!movie){
            alert("Please insert a movie name");
        }else if(!director){
            alert("Please insert a Director name");
        }else if(temp_date == "Invalid Date"){
            alert("Please insert a Release date");
        }else if(!rate){
            alert("Please insert a rating score");
        }else{
            // Add review to Firestore collection
            db.collection("Reviews").add({
                director_name: director,
                movie_name: movie,
                rating: parseInt(rate),
                release_date: temp_date
            })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });			
            
            // Reset form
            $("#movie_name").val('');
            $("#author").val('');
            $("#rating_score").val('');
        }
    });
});
