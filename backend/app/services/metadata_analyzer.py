import io
from typing import Dict, Any, List
from PIL import Image, ExifTags

class MetadataProvenanceAnalyzer:
    """
    Forensic Metadata and Provenance Inspector.
    Extracts EXIF tags, software signatures, compression markers, and timestamps.
    Explicitly documents that metadata alone does NOT prove an image is genuine or fake,
    as metadata can be stripped or fabricated.
    """
    SUSPICIOUS_SOFTWARE_SIGNATURES = [
        "photoshop", "gimp", "midjourney", "stable diffusion", "dall-e",
        "deepface", "faceswap", "faceapp", "reface", "civitai", "automatic1111", "comfyui"
    ]

    def analyze_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        provenance: Dict[str, Any] = {
            "has_exif": False,
            "software_tool": None,
            "camera_make": None,
            "camera_model": None,
            "datetime_original": None,
            "color_space": None,
            "exif_tags_count": 0,
            "suspicious_software_flag": False,
            "metadata_warnings": [],
            "technical_signals": [],
            "disclaimer": "Metadata inspection provides investigative context only. Metadata omission or alteration does not conclusively prove manipulation or authenticity.",
        }

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            provenance["dimensions"] = f"{pil_img.width}x{pil_img.height}"
            provenance["format"] = pil_img.format
            provenance["mode"] = pil_img.mode

            exif_data = pil_img.getexif()
            if exif_data:
                provenance["has_exif"] = True
                provenance["exif_tags_count"] = len(exif_data)

                for tag_id, value in exif_data.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    val_str = str(value).strip()

                    if tag_name == "Software":
                        provenance["software_tool"] = val_str
                        lower_val = val_str.lower()
                        for susp in self.SUSPICIOUS_SOFTWARE_SIGNATURES:
                            if susp in lower_val:
                                provenance["suspicious_software_flag"] = True
                                provenance["metadata_warnings"].append(
                                    f"Digital editing or synthesis software signature detected: '{val_str}'"
                                )
                                provenance["technical_signals"].append("KNOWN_SYNTHESIS_OR_EDITING_TAG")
                    elif tag_name == "Make":
                        provenance["camera_make"] = val_str
                    elif tag_name == "Model":
                        provenance["camera_model"] = val_str
                    elif tag_name == "DateTime":
                        provenance["datetime_original"] = val_str
                    elif tag_name == "ColorSpace":
                        provenance["color_space"] = "sRGB" if str(value) == "1" else str(value)

            if not provenance["has_exif"]:
                provenance["metadata_warnings"].append(
                    "No EXIF metadata present. Stripped metadata is common across social media platforms, privacy scrubbers, and AI generators."
                )
                provenance["technical_signals"].append("METADATA_STRIPPED_OR_ABSENT")
            else:
                provenance["technical_signals"].append("EXIF_CONTAINER_PRESENT")

        except Exception as e:
            provenance["metadata_warnings"].append(f"Error parsing metadata stream: {str(e)}")

        return provenance

metadata_analyzer = MetadataProvenanceAnalyzer()
