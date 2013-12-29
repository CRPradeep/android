package com.tracker.diabetesrecord;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Intent;
import android.provider.AlarmClock;

public class AlarmPlugin extends CordovaPlugin{
	CallbackContext mCallback;
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		mCallback = callbackContext;
		if(action.equalsIgnoreCase("SET_ALARM")){
			int hour;
			String period = "AM";
			String label = "Test BP/Sugar Now";
			/*Calendar cal = new GregorianCalendar();
			int minute, hour, day;
			
		    cal.setTimeInMillis(System.currentTimeMillis());
		    day = cal.get(Calendar.DAY_OF_WEEK);
		    hour = cal.get(Calendar.HOUR_OF_DAY);
		    minute = cal.get(Calendar.MINUTE);*/
			
			hour = args.getInt(0);
			period = args.getString(1);
			label = args.getString(2);
			
			if(period.equalsIgnoreCase("PM")){
				hour = hour==0 ? 0 : 12;
			}
			
		    Intent i = new Intent(AlarmClock.ACTION_SET_ALARM);
		    i.putExtra(AlarmClock.EXTRA_HOUR, hour);
		    i.putExtra(AlarmClock.EXTRA_MINUTES, 0);
		    i.putExtra(AlarmClock.EXTRA_MESSAGE, label);
		    i.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
			
            cordova.getActivity().startActivity(i);
		}
		return true;
	}
}
