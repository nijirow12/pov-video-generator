import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from './types';

const projectsCollection = collection(db, 'projects');

export class ProjectDatabase {
    async createProject(project: Omit<Project, 'id'>): Promise<string> {
        const docRef = await addDoc(projectsCollection, {
            ...project,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    }

    async getProject(id: string): Promise<Project | null> {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
        } as Project;
    }

    async getAllProjects(): Promise<Project[]> {
        const q = query(projectsCollection, orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
            } as Project;
        });
    }

    async updateProject(id: string, data: Partial<Project>): Promise<void> {
        const docRef = doc(db, 'projects', id);
        const updateData: any = { ...data };

        if (data.completedAt) {
            updateData.completedAt = Timestamp.fromDate(data.completedAt);
        }

        await updateDoc(docRef, updateData);
    }
}
