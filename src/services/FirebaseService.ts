import {collection, addDoc} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {db, storage} from '../config/firebase';
import {Recipe, Diet} from '../types/diet';

export class FirebaseService {
    static async uploadExcelFile(file: File, userId: string) {
        const storageRef = ref(storage, `diets/${userId}/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }

    static async saveRecipe(recipe: Omit<Recipe, 'id'>) {
        const recipesRef = collection(db, 'recipes');
        const docRef = await addDoc(recipesRef, recipe);
        return docRef.id;
    }

    static async saveDiet(diet: Omit<Diet, 'id'>) {
        const dietsRef = collection(db, 'diets');
        const docRef = await addDoc(dietsRef, diet);
        return docRef.id;
    }
}