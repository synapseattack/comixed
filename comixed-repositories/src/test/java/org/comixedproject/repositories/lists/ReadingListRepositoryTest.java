/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.repositories.lists;

import static org.junit.Assert.*;

import com.github.springtestdbunit.DbUnitTestExecutionListener;
import com.github.springtestdbunit.annotation.DatabaseSetup;
import java.util.List;
import java.util.Optional;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.repositories.RepositoryContext;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.repositories.users.ComiXedUserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = RepositoryContext.class)
@TestPropertySource(locations = "classpath:application.properties")
@DatabaseSetup("classpath:test-database.xml")
@TestExecutionListeners({
  DependencyInjectionTestExecutionListener.class,
  DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class,
  DbUnitTestExecutionListener.class
})
public class ReadingListRepositoryTest {
  private static final String TEST_EXISTING_LIST_NAME = "First Reading List";
  private static final String TEST_NEW_LIST_NAME = "Third Reading List";
  public static final long TEST_COMIC_ID_1 = 1000L;
  public static final long TEST_COMIC_ID_2 = 1001L;
  private static final long TEST_USER_ID_1 = 1000L;
  private static final long TEST_READING_LIST_ID_1 = 1000L;

  @Autowired private ReadingListRepository repository;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private ComicRepository comicRepository;

  private ComiXedUser reader;
  private Comic comic1;
  private Comic comic2;

  @Before
  public void setUp() {
    reader = userRepository.findById(TEST_USER_ID_1).get();
    comic1 = comicRepository.findById(TEST_COMIC_ID_1).get();
    comic2 = comicRepository.findById(TEST_COMIC_ID_2).get();
  }

  @Test
  public void testFindAllReadingListsForUser() {
    List<ReadingList> result = repository.getAllReadingListsForOwner(reader);

    assertNotNull(result);
    assertEquals(2, result.size());
    for (ReadingList list : result) {
      assertEquals(reader.getId(), list.getOwner().getId());
      switch (list.getId().intValue()) {
        case 1000:
          assertEquals("First Reading List", list.getName());
          break;
        case 1001:
          assertEquals("Second Reading List", list.getName());
          break;
      }
    }
  }

  @Test
  public void testFindReadingListForUser() {
    ReadingList result = repository.findReadingListForUser(reader, TEST_EXISTING_LIST_NAME);

    assertNotNull(result);
    assertEquals(TEST_EXISTING_LIST_NAME, result.getName());
    assertEquals(5, result.getComics().size());
  }

  @Test
  public void testCreateReadingList() {
    ReadingList list = new ReadingList();

    list.setOwner(reader);
    list.setName(TEST_NEW_LIST_NAME);
    list.getComics().add(comic1);
    list.getComics().add(comic2);

    final ReadingList result = repository.save(list);

    assertNotNull(result);
    assertEquals(reader.getId(), result.getOwner().getId());
    assertEquals(list.getComics().size(), result.getComics().size());
  }

  @Test
  public void testUpdateReadingList() {
    ReadingList list = repository.getById(TEST_READING_LIST_ID_1);

    list.getComics().add(comic2);
    repository.save(list);

    ReadingList result = repository.getById(list.getId());

    assertEquals(list.getComics().size(), result.getComics().size());
    boolean found = false;
    for (Comic entry : result.getComics()) {
      found |= (entry.getId().longValue() == comic2.getId().longValue());
    }
    assertTrue(found);
  }

  @Test
  public void testDeleteReadingList() {
    ReadingList list = repository.findById(TEST_COMIC_ID_1).get();

    repository.delete(list);

    Optional<ReadingList> result = repository.findById(TEST_COMIC_ID_1);

    assertFalse(result.isPresent());
  }

  @Test
  public void testAddComicsToReadingList() {
    ReadingList list = repository.getById(TEST_COMIC_ID_1);
    Comic newComic = comicRepository.getById(1021L);

    list.getComics().add(newComic);

    ReadingList result = repository.save(list);

    assertTrue(result.getComics().contains(newComic));
  }

  @Test
  public void testRemoveComicsFromReadingList() {
    ReadingList list = repository.getById(TEST_COMIC_ID_1);
    Comic comic = comicRepository.getById(1001L);

    list.getComics().remove(comic);

    ReadingList result = repository.save(list);

    assertFalse(result.getComics().contains(comic));
  }
}