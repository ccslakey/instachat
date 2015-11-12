Router.configure({
  layoutTemplate: 'app'
});

Router.route('/', function () {
    this.redirect('/general');
});

Router.route('/:channel', function () {
    this.render('messages');
});