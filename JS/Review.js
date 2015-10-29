
Parse.initialize("Qg3LK06FxDIZ3T2ep2x2PQrO2crNgDuGkQA79XQY", "RcEWGTGvPfqLHrrjOtAWQ9WbNla1ubfdrEOvTFFr");

$(function() {
    'use strict';

    var Review = Parse.Object.extend('Review');
    var numOfReviews = 0;
    var totalScore = 0;

    var averageRating = $('#average-rating');

    var reviewList = $('#review-list');

    var ratingElem = $('#rating');

    var ReviewQuery = new Parse.Query(Review);
    ReviewQuery.ascending('createdAt');
    ReviewQuery.notEqualTo('deleted', true);

    var reviews = [];

    var getData = function () {
        ReviewQuery.find({
            success: function (results) {
                buildList(results)
            }
        })
    };

    var buildList = function (data) {
        reviews = data;
        addItem();
    };

    function addItem() {
        reviewList.empty();
        averageRating.empty();
        console.log(totalScore);
        console.log(numOfReviews);
        reviews.forEach(function (oneReview) {
            var rate = $(document.createElement('span'))
                .raty({
                    readOnly: true,
                    score: (oneReview.get('rating')),
                    hints: ['sad', 'bad', 'ehh', 'decent', 'good enough']
                });

            var thumbsUp = $(document.createElement('span'))
                .append('<button id="thumbUp"><i class="fa fa-thumbs-up"> </i></button>');
            var thumbsDown = $(document.createElement('span'))
                .append('<button id="thumbDown"><i class="fa fa-thumbs-down"> </i></button>');
            var close = $(document.createElement('span'))
                .append('<button id="closeIt"><i class="fa fa-times"> </i></button>');
            var li = $('<div class="individualRating">' + '   <b>' + oneReview.get('title')  + '</b></br>' + oneReview.get('opinion') + '</br></div>');
            totalScore += oneReview.get('rating');
            rate.prependTo(li);
            thumbsUp.appendTo(li);
            li.append(thumbsUp.click(function () {
                oneReview.increment('upvotes');
                oneReview.increment('totalVotes');
                oneReview.save().then(addItem);
            }));
            thumbsDown.appendTo(li);
            li.append(thumbsDown.click(function () {
                oneReview.set('upvotes', oneReview.get('upvotes'));
                oneReview.increment('totalVotes');
                oneReview.save().then(addItem);
            }));
            close.appendTo(li);
            li.append(close.click(function () {
                oneReview.set('deleted', true);
                oneReview.save().then(addItem);
            }));
            if(oneReview.get('deleted'))  {
                var comment = $(document.createElement('span')).append('(review will be removed after next refresh)');
                li.append(comment);
            }
            var ratingOfComment = $('<p>' + oneReview.get('upvotes') + ' out of ' + oneReview.get('totalVotes') + ' found this review helpful.'+  '</p>');
            ratingOfComment.appendTo(li);
            numOfReviews++;
            li.appendTo(reviewList);
        });

        var aveRate = $(document.createElement('span'))
            .raty({
                readOnly: true,
                score: totalScore  / numOfReviews
            });
        aveRate.appendTo(averageRating);
    }

    $('form').submit(function () {
        var titleInput = $(this).find('[name="title"]');
        var title = titleInput.val();
        var opinionInput = $(this).find('[name="opinion"]');
        var opinion = opinionInput.val();
        var review = new Review();
        review.set('title', title);
        review.set('opinion', opinion);
        review.set('rating', ratingElem.raty('score'));
        review.set('upvotes', 0);
        review.set('totalVotes', 0);
        review.set('deleted', false);

        review.save().then(getData)
           .then(function () {
                titleInput.val('');
                opinionInput.val('');
                ratingElem.raty('set', {});
        });
        return false;
    });
    getData();
    ratingElem.raty();

});