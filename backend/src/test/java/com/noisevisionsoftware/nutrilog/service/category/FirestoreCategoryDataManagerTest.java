package com.noisevisionsoftware.nutrilog.service.category;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.noisevisionsoftware.nutrilog.model.shopping.category.ProductCategoryData;
import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsedProduct;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FirestoreCategoryDataManagerTest {

    @Mock
    private Firestore firestore;

    @Mock
    private CollectionReference collectionReference;

    @Mock
    private ApiFuture<QuerySnapshot> querySnapshotApiFuture;

    @Mock
    private QuerySnapshot querySnapshot;

    @Mock
    private WriteBatch writeBatch;

    @Mock
    private ApiFuture<List<WriteResult>> writeResultsApiFuture;

    private FirestoreCategoryDataManager firestoreCategoryDataManager;

    @BeforeEach
    void setUp() {
        firestoreCategoryDataManager = new FirestoreCategoryDataManager(firestore);
        when(firestore.collection(anyString())).thenReturn(collectionReference);
    }

    @Test
    void loadData_shouldReturnEmptyMap_whenCollectionIsEmpty() throws ExecutionException, InterruptedException {
        // Given
        when(collectionReference.get()).thenReturn(querySnapshotApiFuture);
        when(querySnapshotApiFuture.get()).thenReturn(querySnapshot);
        when(querySnapshot.getDocuments()).thenReturn(Collections.emptyList());

        // When
        Map<String, ProductCategoryData> result = firestoreCategoryDataManager.loadData();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(collectionReference).get();
    }

    @Test
    void loadData_shouldReturnCategoriesMap_whenCollectionHasDocuments() throws ExecutionException, InterruptedException {
        // Given
        when(collectionReference.get()).thenReturn(querySnapshotApiFuture);
        when(querySnapshotApiFuture.get()).thenReturn(querySnapshot);

        QueryDocumentSnapshot doc1 = mock(QueryDocumentSnapshot.class);
        QueryDocumentSnapshot doc2 = mock(QueryDocumentSnapshot.class);

        ProductCategoryData categoryData1 = ProductCategoryData.builder()
                .productName("marchewka")
                .categoryId("warzywa")
                .usageCount(5)
                .build();

        ProductCategoryData categoryData2 = ProductCategoryData.builder()
                .productName("jabłko")
                .categoryId("owoce")
                .usageCount(3)
                .build();

        when(doc1.getId()).thenReturn("marchewka");
        when(doc1.toObject(ProductCategoryData.class)).thenReturn(categoryData1);
        when(doc2.getId()).thenReturn("jabłko");
        when(doc2.toObject(ProductCategoryData.class)).thenReturn(categoryData2);

        when(querySnapshot.getDocuments()).thenReturn(Arrays.asList(doc1, doc2));

        // When
        Map<String, ProductCategoryData> result = firestoreCategoryDataManager.loadData();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(categoryData1, result.get("marchewka"));
        assertEquals(categoryData2, result.get("jabłko"));
    }

    @Test
    void saveData_shouldSaveCategoriesInBatches() {
        // Given
        Map<String, ProductCategoryData> data = new HashMap<>();
        for (int i = 0; i < 10; i++) {
            data.put("product" + i, ProductCategoryData.builder()
                    .productName("product" + i)
                    .categoryId("category" + (i % 3))
                    .usageCount(i)
                    .build());
        }

        when(firestore.batch()).thenReturn(writeBatch);
        when(writeBatch.commit()).thenReturn(writeResultsApiFuture);
        when(collectionReference.document(anyString())).thenReturn(mock(DocumentReference.class));

        // When
        firestoreCategoryDataManager.saveData(data);

        // Then
        verify(firestore, times(1)).batch();
        verify(writeBatch, times(10)).set(any(DocumentReference.class), any(ProductCategoryData.class));
        verify(writeBatch, times(1)).commit();
    }

    @Test
    @SuppressWarnings("unchecked")
    void updateProduct_shouldUpdateProductInFirestore() throws ExecutionException, InterruptedException {
        // Given
        ParsedProduct oldProduct = ParsedProduct.builder()
                .name("marchewka")
                .original("Marchewka 250g")
                .quantity(250)
                .unit("g")
                .build();

        ParsedProduct newProduct = ParsedProduct.builder()
                .name("marchew")
                .original("Marchew 300g")
                .quantity(300)
                .unit("g")
                .build();

        Query query = mock(Query.class);
        when(collectionReference.whereEqualTo(eq("productName"), anyString())).thenReturn(query);
        when(query.get()).thenReturn(querySnapshotApiFuture);
        when(querySnapshotApiFuture.get()).thenReturn(querySnapshot);

        DocumentReference docRef = mock(DocumentReference.class);
        List<QueryDocumentSnapshot> docList = new ArrayList<>();
        QueryDocumentSnapshot queryDocSnapshot = mock(QueryDocumentSnapshot.class);
        docList.add(queryDocSnapshot);

        when(querySnapshot.isEmpty()).thenReturn(false);
        when(querySnapshot.getDocuments()).thenReturn(docList);
        when(queryDocSnapshot.getReference()).thenReturn(docRef);

        List<String> variations = new ArrayList<>();
        variations.add("marchewka 250g");
        when(queryDocSnapshot.get("variations")).thenReturn(variations);

        ApiFuture<WriteResult> writeResultApiFuture = mock(ApiFuture.class);
        when(docRef.update(anyMap())).thenReturn(writeResultApiFuture);

        // When
        ParsedProduct result = firestoreCategoryDataManager.updateProduct(oldProduct, newProduct);

        // Then
        assertEquals(newProduct, result);

        ArgumentCaptor<Map<String, Object>> updateCaptor = ArgumentCaptor.forClass(Map.class);
        verify(docRef).update(updateCaptor.capture());

        Map<String, Object> updates = updateCaptor.getValue();
        assertEquals("marchew", updates.get("productName"));

        @SuppressWarnings("unchecked")
        List<String> updatedVariations = (List<String>) updates.get("variations");
        assertTrue(updatedVariations.contains("marchew 300g".toLowerCase()));
    }

    @Test
    void updateProduct_shouldHandleEmptyDocuments() throws ExecutionException, InterruptedException {
        // Given
        ParsedProduct oldProduct = ParsedProduct.builder()
                .name("produkt_nieistniejący")
                .original("Nieistniejący produkt")
                .build();

        ParsedProduct newProduct = ParsedProduct.builder()
                .name("nowy_produkt")
                .original("Nowy produkt")
                .build();

        Query query = mock(Query.class);
        when(collectionReference.whereEqualTo(eq("productName"), anyString())).thenReturn(query);
        when(query.get()).thenReturn(querySnapshotApiFuture);
        when(querySnapshotApiFuture.get()).thenReturn(querySnapshot);
        when(querySnapshot.isEmpty()).thenReturn(true);

        // When
        ParsedProduct result = firestoreCategoryDataManager.updateProduct(oldProduct, newProduct);

        // Then
        assertEquals(newProduct, result);
        verify(collectionReference).whereEqualTo(eq("productName"), anyString());
        verify(querySnapshotApiFuture).get();
    }

    @Test
    void loadData_shouldHandleException() throws ExecutionException, InterruptedException {
        // Given
        when(collectionReference.get()).thenReturn(querySnapshotApiFuture);
        when(querySnapshotApiFuture.get()).thenThrow(new InterruptedException("Test exception"));

        // When
        Map<String, ProductCategoryData> result = firestoreCategoryDataManager.loadData();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void saveData_shouldHandleException() throws ExecutionException, InterruptedException {
        // Given
        Map<String, ProductCategoryData> data = Map.of(
                "product1", ProductCategoryData.builder().productName("product1").categoryId("category1").build()
        );

        when(firestore.batch()).thenReturn(writeBatch);
        when(collectionReference.document(anyString())).thenReturn(mock(DocumentReference.class));
        when(writeBatch.commit()).thenReturn(writeResultsApiFuture);
        when(writeResultsApiFuture.get()).thenThrow(new InterruptedException("Test exception"));

        // When & Then
        Exception exception = assertThrows(RuntimeException.class, () -> firestoreCategoryDataManager.saveData(data));

        assertTrue(exception.getMessage().contains("Could not save category data"));
    }
}