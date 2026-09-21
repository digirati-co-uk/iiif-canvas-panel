# Lazy slots

The real IIIF cookbook 0003 manifest supplies Lunchroom Manners. The controls template is a direct child of the panel
and contains one HTML root. It is cloned only while video controls are active, then removed on navigation/disconnect.

The checkbox registers a factory for the native `video` replacement slot. Its descriptor supplies the resource URL. The
default player stays usable while the replacement loads and takes over again when it is removed or fails. Factory
cleanup runs when the outlet disappears or the registration is removed. Authored framework nodes use ordinary slot
assignment instead; they are never cloned or removed by the panel.
