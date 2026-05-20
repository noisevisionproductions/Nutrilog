import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

class Task {
    public static void main(String[] args) throws IOException, InterruptedException {
        String url = "https://docs.google.com/document/d/e/2PACX-1vSZ9d7OCd4QMsjJi2VFQmPYLebG2sGqI879_bSPugwOo_fgRcZLAFyfajPWU91UDiLg-RxRD41lVYRA/pub";
        Document document = Jsoup.connect(url).get();
        Elements rows = document.select("tr");

        List<int[]> coordinates = new ArrayList<>();
        int maxX = 0;
        int maxY = 0;

        for (Element row : rows) {
            Elements cells = row.select("td");

            if (cells.size() >= 3) {
                try {
                    int x = Integer.parseInt(cells.get(0).text().trim());
                    char uniCodeCharacter = cells.get(1).text().trim().charAt(0);
                    int y = Integer.parseInt(cells.get(2).text().trim());

                    coordinates.add(new int[]{x, y, uniCodeCharacter});

                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;

                } catch (Exception e) {
                    System.out.println(" ");
                }
            }
        }

        char[][] grid = new char[maxY + 1][maxX + 1];

        for (int i = 0; i <= maxY; i++) {
            for (int j = 0; j <= maxX; j++) {
                grid[i][j] = ' ';
            }
        }

        for (int[] p : coordinates) {
            int px = p[0];
            int py = p[1];
            char pz = (char) p[2];
            grid[py][px] = pz;
        }

        for (int i = maxY; i >= 0; i--) {
            for (int j = 0; j <= maxX; j++) {
                System.out.print(grid[i][j]);
            }
            System.out.println();
        }
    }
}