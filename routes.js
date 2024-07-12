"use strict";

const adminVerification = require("./middleware/admin_verification");
const userVerification = require("./middleware/user_verification");
const apiAdmin = require("./controllers/admin");
const apiUser = require("./controllers/user");

module.exports = function (app) {
  // API ADMIN
  app.route("/v1/web/login")
    .post(apiAdmin.account_controller.login);

  app
    .route("/v1/web/animals")
    .get(adminVerification, apiAdmin.animal_controller.webanimals);

  app
    .route("/v1/web/animal/:id")
    .get(adminVerification, apiAdmin.animal_controller.webanimalid);

  app
    .route("/v1/web/animal/edit/:id")
    .put(adminVerification, apiAdmin.animal_controller.webanimaledit);

  app
    .route("/v1/web/animal/delete/:id")
    .delete(adminVerification, apiAdmin.animal_controller.webanimaldelete);

  app
    .route("/v1/web/request/accounts")
    .get(adminVerification, apiAdmin.request_account_controller.webrequestaccounts);

  app
    .route("/v1/web/request/account/:id")
    .get(adminVerification, apiAdmin.request_account_controller.webrequestaccountid);

  app
    .route("/v1/web/request/account/approve/:id")
    .put(adminVerification, apiAdmin.request_account_controller.webapproverequestaccount);

  app
    .route("/v1/web/request/datas")
    .get(adminVerification, apiAdmin.request_data_controller.webrequestdatas);

  app
    .route("/v1/web/request/data/:id")
    .get(adminVerification, apiAdmin.request_data_controller.webrequestdataid);

  app
    .route("/v1/web/request/data/approve/:id")
    .put(adminVerification, apiAdmin.request_data_controller.webapproverequestdata);

  app
    .route("/v1/web/request/data/approve/send")
    .post(adminVerification, apiAdmin.request_data_controller.websendrequestdata);

  app
    .route("/v1/web/history/request/data")
    .get(adminVerification, apiAdmin.history_request_data_controller.webhistoryrequestdatas);

  app
    .route("/v1/web/history/request/data/:id")
    .get(adminVerification, apiAdmin.history_request_data_controller.webhistoryrequestdataid);

  app.route("/v1/web/users").get(adminVerification, apiAdmin.user_controller.webusers);

  app.route("/v1/web/user/:id").get(adminVerification, apiAdmin.user_controller.webuserid);

  app
    .route("/v1/web/user/suspend")
    .put(adminVerification, apiAdmin.user_controller.webusersuspend);

  // API USER
  app.route("/v1/mob/user/login").post(userVerification, apiUser.auth.login);

  app
    .route("/v1/mob/animals/editable")
    .get(userVerification, apiUser.editable_animal_controller.mobeditableanimals);

  app.route("/v1/mob/user/check").get(userVerification, apiUser.auth.check_user);

  app
    .route("/v1/mob/animal/:id_animal")
    .get(userVerification, apiUser.editable_animal_controller.mobeditableanimalid);

  app
    .route("/v1/mob/animal/add")
    .post(userVerification, apiUser.editable_animal_controller.mobanimalpost);

  app
    .route("/v1/mob/animal/editable/edit/:id_animal")
    .put(userVerification, apiUser.editable_animal_controller.mobediteditableanimal);

  app
    .route("/v1/mob/animal/editable/delete/:id_animal")
    .delete(userVerification, apiUser.editable_animal_controller.deleteAnimalById);

  app
    .route("/v1/mob/animal/upload/image")
    .post(userVerification, apiUser.editable_animal_controller.mob_upload_image);

  app
    .route("/v1/mob/animal/delete/image")
    .delete(userVerification, apiUser.editable_animal_controller.deleteImageByURL);

  app
    .route("/v1/mob/animals/history")
    .get(userVerification, apiUser.history_animal_controller.mobhistoryanimals);

  app
    .route("/v1/mob/animal/history/:id_animal")
    .get(userVerification, apiUser.history_animal_controller.mobhistoryanimalid);

  app
    .route("/v1/mob/user/account")
    .get(userVerification, apiUser.account_controller.mobaccount);

  app
    .route("/v1/mob/user/account/edit/name")
    .put(userVerification, apiUser.account_controller.mobaccounteditname);

  app
    .route("/v1/mob/user/account/edit/picture")
    .put(userVerification, apiUser.account_controller.mob_update_profile);

  app
    .route("/v1/mob/user/account/edit/password")
    .put(userVerification, apiUser.account_controller.mobaccounteditpassword);

  app
    .route("/v1/mob/user/request-datas")
    .get(userVerification, apiUser.request_data_controller.mobhistoryrequestdata);

  app
    .route("/v1/mob/user/request-data/:id_request_data")
    .get(userVerification, apiUser.request_data_controller.mobhistoryrequestdatabyid);

  app
    .route("/v1/mob/user/request-data/add")
    .post(userVerification, apiUser.request_data_controller.mobaddrequestdata);

  app
    .route("/v1/mob/user/register")
    .post(userVerification, apiUser.account_controller.mobregisteruser);

  app
    .route("/v1/mob/user/check-password")
    .post(userVerification, apiUser.account_controller.mobaccountpassword);

  app
    .route("/v1/mob/user/new_password")
    .put(userVerification, apiUser.account_controller.mobpasswordedit);

  // FORGET PASSWORD
  app
    .route("/v1/web/user/forgot-password")
    .post(apiUser.account_controller.mobforgotpassword);

  // REQUEST DATA GUEST
  app.route("/v1/web/user/request-data")
    .post(apiUser.request_data_controller.requestDataGuest);
};

