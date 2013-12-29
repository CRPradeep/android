package com.tracker.diabetesrecord;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.accounts.Account;
import android.accounts.AccountManager;

public class GetGoogleAccountsPlugin extends CordovaPlugin{

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		if(action.equalsIgnoreCase("GET_GOOGLE_ACC")){
			AccountManager accManager = AccountManager.get(cordova.getActivity());
			Account accs[] = accManager.getAccounts();
			
			JSONArray resArray = new JSONArray();
			
			for(int i=0 ; i<accs.length ; i++){
				JSONObject resObj = new JSONObject();
				
				resObj.put("accName", accs[i].name);
				resObj.put("type", accs[i].type);
				
				resArray.put(resObj);
			}
			callbackContext.success(resArray);
			return true;
		}
		return false;
	}
}
