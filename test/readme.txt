FastJs JavaScript Framework Unit Tests

Tested on browsers
Internet Explorer 9, 10
Firefox 21, 22
Google Chrome 26,27, 28
Opera 12.15, 12.16
Safari 5.1.7

When test rich ajax upload callbacks you have to select some not big size file to check it.
Some browsers opens popup window to select file, some not. You have to click on it on the page bottom.
And some methods is not supported in previous browsers version. That is why tests stop.
E.g. IE9 doesn't support last 4 test related to XMLHttpRequest 2.