import React from 'react';
import { useParams } from 'react-router-dom';
import StudyYearManager from '../../../components/study/StudyYearManager';

export default function StudentMyStudyYears() {
  const { studyYearId } = useParams();
  
  return <StudyYearManager mode="student" studyYearId={studyYearId} />;
}