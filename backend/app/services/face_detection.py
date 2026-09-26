import cv2
import numpy as np
from typing import Tuple, List, Optional
from ..config import settings

class FaceDetectionService:
    def __init__(self):
        # Load high-accuracy OpenCV Haar Cascade for Frontal Face Detection
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Profile cascade for secondary verification if needed
        profile_path = cv2.data.haarcascades + "haarcascade_profileface.xml"
        self.profile_cascade = cv2.CascadeClassifier(profile_path)

    def detect_faces(self, image_bgr: np.ndarray) -> Tuple[int, List[Tuple[int, int, int, int]]]:
        """
        Executes multi-scale face localization.
        Returns:
            face_count (int): Total verified faces.
            boxes (list of (x, y, w, h)): Bounding coordinates.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        # Histogram equalization to enhance contrast in poorly illuminated scenes
        gray_eq = cv2.equalizeHist(gray)

        # Detect frontal faces
        frontal_faces = self.face_cascade.detectMultiScale(
            gray_eq,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(settings.MIN_FACE_SIZE, settings.MIN_FACE_SIZE),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        detected_boxes = list(frontal_faces) if len(frontal_faces) > 0 else []

        # If zero frontal detected, check profile cascade
        if len(detected_boxes) == 0:
            profile_faces = self.profile_cascade.detectMultiScale(
                gray_eq,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(settings.MIN_FACE_SIZE, settings.MIN_FACE_SIZE),
            )
            if len(profile_faces) > 0:
                detected_boxes = list(profile_faces)

        # Filter out overlapping sub-boxes using non-maximum suppression (NMS)
        if len(detected_boxes) > 1:
            detected_boxes = self._apply_nms(detected_boxes)

        return len(detected_boxes), [tuple(map(int, b)) for b in detected_boxes]

    def _apply_nms(self, boxes: List[Tuple[int, int, int, int]], overlap_thresh: float = 0.3) -> List[Tuple[int, int, int, int]]:
        """Removes duplicate detections over the exact same subject."""
        if len(boxes) == 0:
            return []

        boxes_arr = np.array(boxes)
        x1 = boxes_arr[:, 0]
        y1 = boxes_arr[:, 1]
        x2 = boxes_arr[:, 0] + boxes_arr[:, 2]
        y2 = boxes_arr[:, 1] + boxes_arr[:, 3]

        areas = (x2 - x1 + 1) * (y2 - y1 + 1)
        order = np.argsort(y2)
        keep = []

        while len(order) > 0:
            i = order[-1]
            keep.append(i)

            xx1 = np.maximum(x1[i], x1[order[:-1]])
            yy1 = np.maximum(y1[i], y1[order[:-1]])
            xx2 = np.minimum(x2[i], x2[order[:-1]])
            yy2 = np.minimum(y2[i], y2[order[:-1]])

            w = np.maximum(0, xx2 - xx1 + 1)
            h = np.maximum(0, yy2 - yy1 + 1)

            overlap = (w * h) / areas[order[:-1]]
            order = np.delete(order, np.concatenate(([len(order) - 1], np.where(overlap > overlap_thresh)[0])))

        return [tuple(boxes[k]) for k in keep]

face_detector = FaceDetectionService()
