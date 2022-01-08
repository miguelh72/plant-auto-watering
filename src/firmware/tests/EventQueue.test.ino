//#include "LinkedListLib.h"
#include "UnitTest.h"

#include "EventQueue.h"

void setup()
{
  Serial.begin(9600);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB
  }

  TEST_RUN("Register an event listener function to a specific event name.", testRegisterEventListener);
  TEST_RUN("Register an event listener function to a specific event name.", testRemoveEventListener);
  TEST_RUN("Listener functions receive emitted event and correct payload.", testEmittingEvent);
  TEST_RUN("Event listeners are triggered after event is emitted on handle function call", testListenerReceivesEvent);
}

void loop() {}

void cleanup()
{
  // Note: this is absolutely causing memory leaks it just doesn't matter in the context of this small test
  EventQueue::_events = new LinkedList<EventListItem *>();
  EventQueue::_queue = new LinkedList<EventQueueItem *>();
}

void testCallback(void *payload) {}
void testCallback2(void *payload) {}

void testRegisterEventListener()
{
  char *eventName = "TestEventName";
  EventQueue::on(eventName, &testCallback);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(0)->subscribers->size(), 1);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testCallback);

  char *eventName2 = "SecondTestEventName";
  EventQueue::on(eventName2, &testCallback2);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->size(), 2);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_events->get(1)->name), String(eventName2));
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(0)->subscribers->size(), 1);
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(1)->subscribers->size(), 1);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testCallback);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(1)->subscribers->get(0), &testCallback2);

  cleanup();
}

void testRemoveEventListener()
{
  char *eventName = "TestEventName";
  EventQueue::on(eventName, &testCallback);
  EventQueue::on(eventName, &testCallback2);

  EventQueue::remove(eventName, &testCallback);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(0)->subscribers->size(), 1);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testCallback2);

  // Removing function that doesn't exist should have no effect
  EventQueue::remove(eventName, &testCallback);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(0)->subscribers->size(), 1);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testCallback2);

  EventQueue::remove(eventName, &testCallback2);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_INT(EventQueue::_events->get(0)->subscribers->size(), 0);

  cleanup();
}

void testEmittingEvent()
{
  char *eventName = "TestEventName";
  char *payloadString = "TestPayload";
  EventQueue::emit(eventName, (void *)payloadString);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_queue->size(), 1);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_queue->get(0)->name), String(eventName));
  ASSERT_EQUAL_POINTER(EventQueue::_queue->get(0)->payload, payloadString);

  char *eventName2 = "TestEventName";
  char *payloadString2 = "TestPayload";
  EventQueue::emit(eventName2, (void *)payloadString2);

  ASSERT_EQUAL_INT_SILENT(EventQueue::_queue->size(), 2);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_queue->get(0)->name), String(eventName));
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_queue->get(1)->name), String(eventName2));
  ASSERT_EQUAL_POINTER_SILENT(EventQueue::_queue->get(0)->payload, payloadString);
  ASSERT_EQUAL_POINTER(EventQueue::_queue->get(1)->payload, payloadString2);

  cleanup();
}

char *receivedPayload = "NotCalled";
int numCalls = 0;
void testListener(void *payload)
{
  receivedPayload = (char *)payload;
  numCalls++;
}

void testListenerReceivesEvent()
{
  ASSERT_EQUAL_STRING_SILENT(String(receivedPayload), String("NotCalled"));

  char *eventName = "TestEventName";
  char *testPayload = "TestPayload";
  EventQueue::on(eventName, &testListener);
  EventQueue::emit(eventName, testPayload);

  EventQueue::handleEvents();

  ASSERT_EQUAL_INT_SILENT(EventQueue::_queue->size(), 0);
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING_SILENT(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_INT_SILENT(EventQueue::_events->get(0)->subscribers->size(), 1);
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testListener);

  ASSERT_EQUAL_INT_SILENT(numCalls, 1);
  ASSERT_EQUAL_STRING(String(receivedPayload), String(testPayload));

  EventQueue::handleEvents();

  ASSERT_EQUAL_INT(numCalls, 1);

  cleanup();
}
