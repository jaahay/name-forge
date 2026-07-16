import { useState, type ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
import type { NameArtifact } from '../engine/nameArtifact';
import { analyzeNameArtifact } from '../engine/nameArtifactAnalysis';
import type { NameVariant } from '../engine/types';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

interface