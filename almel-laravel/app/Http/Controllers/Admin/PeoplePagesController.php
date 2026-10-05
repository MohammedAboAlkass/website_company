<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\PeopleSupport as PS;

/** Blade shells of the FAQ, Appeal + announcements and Impact-map pages (data comes from the JSON controllers). The partners page is PartnerController@index. */
class PeoplePagesController extends Controller
{
    public function faq()
    {
        return view('admin.faq.index', ['opts' => PS::options()]);
    }

    public function appeal()
    {
        return view('admin.appeal.index', ['opts' => PS::options()]);
    }

    public function impact()
    {
        return view('admin.impact.index', ['opts' => PS::options()]);
    }
}
