'use strict';

// Current date helper function
const currentDate = () => {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var mm = m < 10 ? '0' + m : m;
    var dd = d < 10 ? '0' + d : d;
    return '' + y + mm + dd;
}


export {currentDate}