import { combineReducers } from '@reduxjs/toolkit';
import common from './common/store';
import tonkeeper from './common/store';

export default combineReducers({
  common,
  tonkeeper,
});
