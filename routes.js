"use strict";

const adminVerification = require("./middleware/admin_verification");
const userVerification = require("./middleware/user_verification");
const apiAdmin = require("./controllers/admin");
const apiUser = require("./controllers/user");
const setCache = require('./middleware/setCache');
const clearCache = require("./middleware/clearCache");

module.exports = function (app) {
  // API ADMIN
  app
    .route("/v1/web/login")
    .post(apiAdmin.account_controller.login);
    // REQ BODY {email, password}

  app
    .route("/v1/web/animals")
    .get(adminVerification, setCache(1800), apiAdmin.animal_controller.webanimals);
    // REQ QUERY {page(int), search, date_start, date_end}

  app
    .route("/v1/web/animal/:id")
    .get(adminVerification, setCache(1800), apiAdmin.animal_controller.webanimalid);


  app
    .route("/v1/web/animal/edit/:id")
    .put(adminVerification, clearCache("animal"), apiAdmin.animal_controller.webanimaledit);
    // REQ BODY {local_name,latin_name,habitat,description,city,longitude,latitude,image(string),amount(int)} 


  app
    .route("/v1/web/animal/delete/:id")
    .delete(adminVerification, clearCache("animal"), apiAdmin.animal_controller.webanimaldelete);

  app
    .route("/v1/web/request/accounts")
    .get(adminVerification, setCache(3600), apiAdmin.request_account_controller.webrequestaccounts);
    // REQ QUERY {page(int), search, approve(int 0/1), date_start, date_end}

  app
    .route("/v1/web/request/account/:id")
    .get(adminVerification, setCache(3600), apiAdmin.request_account_controller.webrequestaccountid);

  app
    .route("/v1/web/request/account/approve/:id")
    .put(adminVerification, clearCache("account"), apiAdmin.request_account_controller.webapproverequestaccount);
    // REQ BODY {approve(int 0/1)}

  app
    .route("/v1/web/request/datas")
    .get(adminVerification, setCache(3600), apiAdmin.request_data_controller.webrequestdatas);
    // REQ QUERY { page, search, date_start, date_end }

  app
    .route("/v1/web/request/data/:id")
    .get(adminVerification, setCache(3600), apiAdmin.request_data_controller.webrequestdataid);

  app
    .route("/v1/web/request/data/approve/:id")
    .put(adminVerification, clearCache("data"), apiAdmin.request_data_controller.webapproverequestdata);
    // REQ BODY {approve(int 0/1)}

  app
    .route("/v1/web/request/data/approve/send")
    .post(adminVerification, clearCache("data"), apiAdmin.request_data_controller.websendrequestdata);
    // REQ BODY {local_name(int 0/1), latin_name(int 0/1), habitat(int 0/1), description(int 0/1), city(int 0/1), longitude(int 0/1),latitude(int 0/1), image(int 0/1), amount(int 0/1), date_start, date_end, id_request_data(int)}

  app
    .route("/v1/web/history/request/data")
    .get(adminVerification, setCache(3600), apiAdmin.history_request_data_controller.webhistoryrequestdatas);
    // REQ QUERY { page, search, date_start, date_end }

  app
    .route("/v1/web/history/request/data/:id")
    .get(adminVerification, setCache(3600), apiAdmin.history_request_data_controller.webhistoryrequestdataid);

  app
    .route("/v1/web/users")
    .get(adminVerification, setCache(3600), apiAdmin.user_controller.webusers);
    // req query { page(int), search, status(int(0/1)) }

  app
    .route("/v1/web/user/:id")
    .get(adminVerification, setCache(3600), apiAdmin.user_controller.webuserid);

  app
    .route("/v1/web/user/suspend")
    .put(adminVerification, clearCache("user"), apiAdmin.user_controller.webusersuspend);
    // req body {id(int), status(int(0/1))}


  // CREATE ACCOUNT ADMIN
  app
    .route("/v1/web/create-account")
    .post(apiAdmin.account_controller.create_admin);
    // req body { name, email }

  // VERIFY
  app
    .route("/v1/web/verify-account/:token")
    .get(apiAdmin.account_controller.verify_account);

  // RESET
  app
    .route("/v1/web/reset-password")
    .post(apiAdmin.account_controller.reset_password);
    // req body { email }

  // GET ADMINS
  app
    .route("/v1/web/admins")
    .get(adminVerification, setCache(86400), apiAdmin.account_controller.show_admin);
    // req query { page(int), search, date_start, date_end }

  // DELETE ADMIN
  app
    .route("/v1/web/admin/delete/:id_admin")
    .delete(adminVerification, clearCache("admin"), apiAdmin.account_controller.delete_admin);
    // only super admin can delete other admin

  // EDIT ADMIN
  app
    .route("/v1/web/admin/edit")
    .put(adminVerification, clearCache("admin"), apiAdmin.account_controller.update_admin);
    // req decoded { id_admin (int) }
    // req body { name, password, confirmation_password }

  // PROFILE 
  app
    .route("/v1/web/admin/profile")
    .get(adminVerification, setCache(86400, true), apiAdmin.account_controller.admin_profile);
    // req decoded { id_admin (int) }


  // SUGGESTIONS
  app
    .route("/v1/web/suggestions")
    .get(adminVerification, setCache(86400), apiAdmin.suggestion_controller.getAllSugestions);
    // req query { page(int), search }

  app
    .route("/v1/web/suggestions")
    .post(adminVerification, clearCache('suggestion'), adminVerification, apiAdmin.suggestion_controller.createSuggestion)
    // req body { local_name, latin_name }

  app
    .route("/v1/web/suggestions/:id")
    .put(adminVerification, clearCache('suggestion'), apiAdmin.suggestion_controller.editSuggestion)
    // req body { local_name, latin_name }

  app
    .route("/v1/web/suggestions/:id")
    .delete(adminVerification, clearCache('suggestion'), apiAdmin.suggestion_controller.deleteSuggestion)











  // API USER
  app.route("/v1/mob/user/login").post(apiUser.auth.login);
  // req body { email, password }

  app
    .route("/v1/mob/animals/editable")
    .get(userVerification, setCache(43200, true), apiUser.editable_animal_controller.mobeditableanimals);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/user/check")
    .get(userVerification,setCache(300,true), apiUser.auth.check_user);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/animal/:id_animal")
    .get(userVerification, setCache(43200, true), apiUser.editable_animal_controller.mobeditableanimalid);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/animal/add")
    .post(userVerification,clearCache('animal',true), apiUser.editable_animal_controller.mobanimalpost);
    // req decoded { id_user (int) }
    // req body {local_name,latin_name,habitat,description,city,longitude,latitude,image(string),amount(int)}

  app
    .route("/v1/mob/animal/editable/edit/:id_animal") // without image
    .put(userVerification,clearCache('animal',true), apiUser.editable_animal_controller.mobediteditableanimal);
    // req decoded { id_user (int) }
    // req body {local_name,latin_name,habitat,description,city,longitude,latitude,image(string),amount(int)}

  app
    .route("/v1/mob/animal/editable/delete/:id_animal")
    .delete(userVerification,clearCache('animal',true), apiUser.editable_animal_controller.deleteAnimalById);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/animal/upload/image") // image 
    .post(userVerification,clearCache('animal',true), apiUser.editable_animal_controller.mob_upload_image);
    // req decoded { id_user (int) }
    // req body {image}
    // multipart/form-data

  app
    .route("/v1/mob/animal/delete/image") // delete image
    .delete(userVerification,clearCache('animal',true), apiUser.editable_animal_controller.deleteImageByURL);
    // req decoded { id_user (int) }
    // req body {imageUrl(string)|from response}

  app
    .route("/v1/mob/animals/history")
    .get(userVerification,setCache(43200, true), apiUser.history_animal_controller.mobhistoryanimals);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/animal/history/:id_animal")
    .get(userVerification,setCache(43200, true), apiUser.history_animal_controller.mobhistoryanimalid);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/user/account")
    .get(userVerification,setCache(43200, true), apiUser.account_controller.mobaccount);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/user/account/edit/name")
    .put(userVerification,clearCache('user',true), apiUser.account_controller.mobaccounteditname);
    // req decoded { id_user (int) }
    // req body { name }

  app
    .route("/v1/mob/user/account/edit/picture")
    .put(userVerification,clearCache('user',true), apiUser.account_controller.mob_update_profile);
    // req decoded { id_user (int) }
    // req body { image }
    // multipart/form-data


  app
    .route("/v1/mob/user/account/edit/password")
    .put(userVerification,clearCache('user',true), apiUser.account_controller.mobaccounteditpassword);
    // req decoded { id_user (int) }
    // req body { old_password, new_password }

  app
    .route("/v1/mob/user/request-datas")
    .get(userVerification,setCache(43200, true), apiUser.request_data_controller.mobhistoryrequestdata);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/user/request-data/:id_request_data")
    .get(userVerification,setCache(43200, true), apiUser.request_data_controller.mobhistoryrequestdatabyid);

  app
    .route("/v1/mob/user/request-data/add")
    .post(userVerification,clearCache('data'), apiUser.request_data_controller.mobaddrequestdata);
    // req decoded { id_user (int) }

  app
    .route("/v1/mob/user/request-data/add/attachment")
    .post(userVerification, clearCache('data'), apiUser.request_data_controller.uploadAttachment);
    // req decoded { id_user (int) }
    // req body {image}
    // multipart/form-data

  app
    .route("/v1/mob/user/register")
    .post(clearCache('account'), apiUser.account_controller.mobregisteruser);
    // req body {name,email,phone,profession,instances,kepentingan,deskripsi}

  app
    .route("/v1/mob/user/check-password")
    .post( userVerification,clearCache('check',true), apiUser.account_controller.mobaccountpassword);
    // req decoded { id_user (int) }
    // req body {password}

  app
    .route("/v1/mob/user/new_password")
    .put(userVerification,clearCache('check',true), apiUser.account_controller.mobpasswordedit);
    // req decoded { id_user (int) }
    // req body {new_password}

  // FORGET PASSWORD
  app
    .route("/v1/web/user/forgot-password")
    .post(apiUser.account_controller.mobforgotpassword);
    // req body { email, otp }

  // REQUEST DATA GUEST
  app.route("/v1/web/user/request-data")
    .post(apiUser.request_data_controller.requestDataGuest);
    // req body { name, email, profession, instances, subject, body, attachment }

  app.route("/v1/web/user/request-data/attachment")
    .post(apiUser.request_data_controller.uploadAttachment);
    // req body {image}
    // multipart/form-data

  // SUGESTIONS
  app.route("/v1/mob/user/suggestion")
    .get(userVerification, setCache(86400), apiUser.suggestion_controller.showSuggestion);
    // req query { q (string) }
};

