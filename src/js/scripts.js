/* ================
import
================ */
import SmoothScroll from 'smooth-scroll';

import {SimpleScrollTrigger} from "simple-scroll-trigger";

/* ================
window.AddPackagesにいれる
================ */
class AddPackages{
    SmoothScroll($trigger,$settings){
        return new SmoothScroll($trigger,$settings);
    };
    SimpleScrollTrigger($settings){
        new SimpleScrollTrigger($settings);
    };
}
window.AddPackages = new AddPackages();
