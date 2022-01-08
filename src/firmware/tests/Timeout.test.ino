#include "UnitTest.h"

#include "Timeout.h"

#define TIME_TOLERANCE 4

void setup()
{
  Serial.begin(115200);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB
  }

  TEST_RUN("Register a callback with setTimeout.", testRegisterSetTimeoutCallback);
  TEST_RUN("Clear timeouts with timeoutID.", testClearTimeout);
  TEST_RUN("Callbacks are triggered after their timeout expires", testCallbacksTriggered);
}

void loop() {}

void cleanup()
{
  // Note: this is absolutely causing memory leaks it just doesn't matter in the context of this small test
  Timeout::_queue = new LinkedList<TimeoutQueueItem *>();
}

void testCallback() {}
void testCallback2() {}

void testRegisterSetTimeoutCallback()
{
  int timeout = 100;
  unsigned long currentTime = millis();

  int timeoutID = setTimeout(&testCallback, timeout);

  ASSERT_EQUAL_INT_SILENT(timeoutID, 0);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 1);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(0)->timeoutID, 0);
  ASSERT_EQUAL_POINTER_SILENT(Timeout::_queue->get(0)->callback, &testCallback);
  ASSERT_TRUE(Timeout::_queue->get(0)->expiresAt - (currentTime + timeout) < TIME_TOLERANCE);

  currentTime = millis();
  timeoutID = setTimeout(&testCallback2, timeout * 2);

  ASSERT_EQUAL_INT_SILENT(timeoutID, 1);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 2);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(0)->timeoutID, 0);
  ASSERT_EQUAL_POINTER_SILENT(Timeout::_queue->get(0)->callback, &testCallback);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(1)->timeoutID, 1);
  ASSERT_EQUAL_POINTER_SILENT(Timeout::_queue->get(1)->callback, &testCallback2);
  ASSERT_TRUE(Timeout::_queue->get(1)->expiresAt - (currentTime + timeout * 2) < TIME_TOLERANCE);

  cleanup();
}

void testClearTimeout()
{
  int timeout = 0;

  int timeoutID1 = setTimeout(&testCallback, timeout);
  int timeoutID2 = setTimeout(&testCallback2, timeout);

  // Clear front of the queue
  bool result = clearTimeout(timeoutID1);

  ASSERT_TRUE_SILENT(result);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 1);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(0)->timeoutID, timeoutID2);
  ASSERT_EQUAL_POINTER(Timeout::_queue->get(0)->callback, &testCallback2);

  // Attempting to clear event that doesn't exist should have no effect
  result = clearTimeout(timeoutID1);

  ASSERT_FALSE_SILENT(result);
  ASSERT_EQUAL_INT(Timeout::_queue->size(), 1);

  cleanup();
  timeoutID1 = setTimeout(&testCallback, timeout);
  timeoutID2 = setTimeout(&testCallback2, timeout);

  // clear end of the queue
  result = clearTimeout(timeoutID2);

  ASSERT_TRUE(result);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 1);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(0)->timeoutID, timeoutID1);
  ASSERT_EQUAL_POINTER(Timeout::_queue->get(0)->callback, &testCallback);

  cleanup();
}

int numCalls = 0;
void mockCallback()
{
  numCalls++;
}

void testCallbacksTriggered()
{
  int timeout = 100;

  int timeoutID1 = setTimeout(&mockCallback, timeout);
  int timeoutID2 = setTimeout(&mockCallback, timeout * 2);

  // Not enough time has passed
  Timeout::handleExpiredCallbacks();

  ASSERT_EQUAL_INT_SILENT(numCalls, 0);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 2);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->get(0)->timeoutID, timeoutID1);
  ASSERT_EQUAL_INT(Timeout::_queue->get(1)->timeoutID, timeoutID2);

  delay(timeout);
  Timeout::handleExpiredCallbacks();

  ASSERT_EQUAL_INT_SILENT(numCalls, 1);
  ASSERT_EQUAL_INT_SILENT(Timeout::_queue->size(), 1);
  ASSERT_EQUAL_INT(Timeout::_queue->get(0)->timeoutID, timeoutID2);

  delay(timeout);
  Timeout::handleExpiredCallbacks();

  ASSERT_EQUAL_INT_SILENT(numCalls, 2);
  ASSERT_EQUAL_INT(Timeout::_queue->size(), 0);

  cleanup();

  // Test if multiple callbacks can be triggered if they both expired
  timeoutID1 = setTimeout(&mockCallback, timeout);
  timeoutID2 = setTimeout(&mockCallback, timeout);

  delay(timeout);
  Timeout::handleExpiredCallbacks();

  ASSERT_EQUAL_INT_SILENT(numCalls, 4);
  ASSERT_EQUAL_INT(Timeout::_queue->size(), 0);

  cleanup();
}
