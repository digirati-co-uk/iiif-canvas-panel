# Glossary

### IIIF 

[IIIF](https://iiif.io/), pronounced "triple-eye-eff", is a set of standards for working with digital objects on the web, such as digitised books, manuscripts, artworks, movies and audio. It's typically used by galleries, libraries, archives and museums to present their collections and make them _interoperable_ - they become available to software such as viewers, annotation tools, digital exhibits and more.

### Manifest

The unit of distribution of IIIF is the [Manifest](https://iiif.io/api/presentation/3.0/#52-manifest) - a JSON document, that contains a sequence of one or more _Canvases_ (see next definition), with accompanying metadata and (sometimes) structural information. A IIIF Viewer loads a Manifest and generates the UI to allow the user to navigate around, e.g., from page to page of a book, or from scene to scene of an opera.

### Canvas

A Canvas is a bit like a PowerPoint slide - the virtual space that content is arranged on. A Manifest has one or more of these "slides" - for example, one for each page of a book - and each slide has content - most commonly, one image filling the whole Canvas. Rather than a Manifest having a simple list of images, it has a sequence of Canvases, and each Canvas has one (or sometimes more) images. This additional layer of abstraction gives IIIF its power.

Unlike a PowerPoint slide, there is no standard shape (aspect ratio) for a Canvas - it usually _represents_ a view of an object such as a page of a book, or a painting, so has the aspect ratio of that page, or that painting. This aspect ratio is expressed as a pair of integers: a Canvas has a width and a height. These establish a simple coordinate system, so we can refer to points and shapes on the canvas, and place images onto the Canvas. 

Starting in version 3, the IIIF Canvas also supports a time dimension. A Canvas can have a duration, as well as (or for audio, instead of) a width and height. This allows time-based media to be presented via IIIF.

### Annotation

An Annotation is a resource that conforms to the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/). An annotation can target a IIIF Canvas - either the whole Canvas, or a point, or a rectangle, or a shape, or an extent of time in the Canvas. Most obviously, an Annotation can be used to comment on the Canvas - to say something about a particular region of the Canvas, to transcribe and/or translate a word or line or sentence, to tag a person in a photograph, to provide a caption for spoken words in audio. The Annotation is a mechanism for associating any resource, from a simple string to any resource on the web, with a Canvas or with a region of the Canvas. More subtly, IIIF uses this ability to associate the images, audio and video content of the digital object with the Canvas, rather than use some other mechanism to position content. The annotations used to connect the content of the canvas are called _painting_ annotations (they have the [motivation](https://www.w3.org/TR/annotation-model/#motivation-and-purpose) painting), in contrast to other types of annotation which connect material that _supplements_ the Canvas (such as a transcription), _comments_ on the canvas, _tags_ the canvas, and so on.