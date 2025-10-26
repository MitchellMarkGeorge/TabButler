import { describe, it, expect } from 'vitest';
import { actions } from './actions';
import { Message } from '@common/types';

describe('Actions Configuration', () => {
  it('should have correct message for "Open Twitter" action', () => {
    const openTwitterAction = actions.find(action => action.name === 'Open Twitter');

    expect(openTwitterAction).toBeDefined();
    expect(openTwitterAction?.message).toBe(Message.OPEN_TWITTER);
  });

  it('should have correct message for "Open Facebook" action', () => {
    const openFacebookAction = actions.find(action => action.name === 'Open Facebook');

    expect(openFacebookAction).toBeDefined();
    expect(openFacebookAction?.message).toBe(Message.OPEN_FACEBOOK);
  });

  it('should not have any action with mismatched name and message', () => {
    // This test ensures that action names match their messages
    const actionNameToMessage: Record<string, Message> = {
      'New Tab': Message.OPEN_NEW_TAB,
      'New Window': Message.OPEN_NEW_WINDOW,
      'New Incognito Window': Message.OPEN_INCOGNITO_WINDOW,
      'Close Tab': Message.CLOSE_CURRENT_TAB,
      'Close Window': Message.CLOSE_CURRENT_WINDOW,
      'Duplicate Tab': Message.DUPLICATE_TAB,
      'Close Other Tabs in Window': Message.CLOSE_OTHER_TABS,
      'Open Google': Message.OPEN_GOOGLE,
      'Open Youtube': Message.OPEN_YOUTUBE,
      'Open Facebook': Message.OPEN_FACEBOOK,
      'Open Twitter': Message.OPEN_TWITTER,
    };

    actions.forEach(action => {
      const expectedMessage = actionNameToMessage[action.name];
      if (expectedMessage) {
        expect(action.message).toBe(expectedMessage);
      }
    });
  });
});
