package org.comixedproject.model.messaging;

/**
 * <code>Constants</code> is a namespace for constant values used by the messaging system.
 *
 * @author Darryl L. Pierce
 */
public interface Constants {
  /** Message sent to start the process of loading comic formats for a browsers. */
  String LOAD_COMIC_FORMATS = "comic-format.load";

  /** Topic which receives the set of comic formats. */
  String COMIC_FORMAT_UPDATE_TOPIC = "/topic/comic-format.update";

  /** Message sent to start loading scan types. */
  String LOAD_SCAN_TYPES = "scan-types.load";

  /** Topic which receives scan type updates. */
  String SCAN_TYPE_UPDATE_TOPIC = "/topic/scan-type.update";

  /** Topic which receives comic updates in real time. */
  String COMIC_LIST_UPDATE_TOPIC = "/topic/comic-list.update";
}