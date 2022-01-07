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
}

void loop() {}

void cleanup()
{
  // Note: this is absolutely causing memory leaks it just doesn't matter in the context of this small test
  EventQueue::_events = new LinkedList<EventListItem *>();
  EventQueue::_queue = new LinkedList<EventQueueItem *>();
}

void testCallback(void *payload) {}

void testRegisterEventListener()
{
  char *eventName = "TestEventName";
  EventQueue::on(eventName, &testCallback);

  ASSERT_EQUAL_INT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_POINTER(EventQueue::_events->get(0)->subscribers->get(0), &testCallback);

  cleanup();
}

void testRemoveEventListener()
{
  char *eventName = "TestEventName";
  EventQueue::on(eventName, &testCallback);

  EventQueue::remove(eventName, &testCallback);

  ASSERT_EQUAL_INT(EventQueue::_events->size(), 1);
  ASSERT_EQUAL_STRING(String(EventQueue::_events->get(0)->name), String(eventName));
  ASSERT_EQUAL_INT(EventQueue::_events->get(0)->subscribers->size(), 0);

  cleanup();
}

void testEmittingEvent()
{
  char *eventName = "TestEventName";
  char *payloadString = "TestPayload";
  EventQueue::emit(eventName, (void *)payloadString);

  ASSERT_EQUAL_INT(EventQueue::_queue->size(), 1);
  ASSERT_EQUAL_STRING(String(EventQueue::_queue->get(0)->name), String(eventName));
  ASSERT_EQUAL_POINTER(EventQueue::_queue->get(0)->payload, payloadString);

  cleanup();
}
