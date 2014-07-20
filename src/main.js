/* global window, CONFIG, angular, app, document */

app.constant('api', CONFIG.api);

if (CONFIG.environment === 'production') {
    window.analytics.load(CONFIG.analytics);
    window.analytics.page();
}    

platform.ready(function() {
    angular.bootstrap(document, [app.name]);
});
