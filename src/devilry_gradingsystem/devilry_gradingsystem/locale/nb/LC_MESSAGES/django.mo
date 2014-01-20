��    S      �  q   L        %       7    N  X   c	     �	  �   �	  %   �
     �
  	   �
  q     
   w     �  	   �     �  �   �     7  
   <     G     U     ]     k     r     �  	   �  	   �  	   �     �     �  )   �  -   �  8   	  �   B     �     �     �  	   �     �  !     )   .     X  j   ]  X   �  5   !     W  �   d  '   %     M     T     \     m     v     �     �     �     �  
   �  0   �  !     0   -  )   ^  1   �  �   �  
   �     �  .   �  y   �     f  �   |  �   "  �   �  q   �  g   ,     �     �     �  �   �  }   �  B     Q   P     �    "     *  j  :    �     �  �   �  n   �            ,   -      Z  	   {  h   �     �     �  
   �        �         �      �      �      �      �      �      �   
   !     !     !     &!     3!     9!  2   >!  0   q!  0   �!  [   �!     /"     ="     D"  
   U"     `"     x"  .   �"     �"  }   �"  c   B#  <   �#     �#  �   �#  +   �$     �$     �$     �$     %      %     3%     H%     Q%     _%     }%  )   �%  (   �%  8   �%     &  5   5&  �   k&  	   P'     Z'  4   t'  ^   �'     (  �   (  �   �(  �   t)  `   *  ^   {*     �*  
   �*     �*  �   �*  �   �+  J   P,  ?   �,  �   �,  �   w-     t.     Q                  3      M   9   -   L           >   4   ?       )   A   B   K   <       !   C       J      :   7       H       	   P   "   6                E       2   .   8   %   0   R          /   O           N                             $   ,       #                (              F              +   *       I   G   '       ;             =   @   &          
         5      1   S      D                             
                If none of the plugins shown in the first page of the <em>Reconfigure the grading system</em> wizard fit your needs, please contact your local devilry system administrators, or contact the developers of the Devilry open source project directly at %(websitelink)s.
             %(percent)s%% Complete A longer text that students can view. This is usually the detailed feedback text, however some grading system plugins also fill this with autogenerated information based on input from examiners. What a grading system plugin can display in the long text is virtually unlimited. A very short text that students view. Usually something like: "Approved", "B" or "7/10". Add more rows Any grade in Devilry is represented as a number. This number is used for statistics and to calculate final grades. Points is not available directly to students, but some grading system plugins make them available through the "Short text" (below). As a text looked up in a custom table As passed or failed As points Before you can provide feedback to your students, you have to reconfigure the grading system for this assignment. Blockquote Bold Configure Current configuration Devilry has a plugin architecture for grading systems. This makes it easy to handle vastly diverging methods of providing feedback to students. Edit Edit draft Edit feedback Example Feedback text Finish Grading system Heading Heading 1 Heading 2 Heading 3 Help Home How are results presented to the student? How do you provide feedback to your students? How would you like to provide feedback to your students? If none of the choices for configuring the grading system fit your needs, please go back to the previous page, and read about plugins. Insert link Italic LaTeX mathematics Long text Map points to grade Maximum possible number of points Minumum number of points required to pass Next No grading system configured. This can happen if this assignment was created using Devilry 1.3.6 or older. No students have been given feedback yet, and no examiner has saved any feedback drafts. One or more of the selected groups has no deliveries. Ordered list Please select how you provide feedback to your students from the list below. Your selection starts a wizard that you have to complete before any deliveries can be corrected on this assignment. Plugins and why you may care about them Points Preview Preview feedback Previous Programming code Programming language Publish Reconfigure Reconfigure the grading system Save draft Select how results are presented to the students Select the grade required to pass Select the grade required to pass the assignment Set the maximum possible number of points Set the minumum number of points required to pass Setup how you wish to map points to grade. Specify the grade in the first column, and the minimum number of points required to get that grade in the second column. The first row must have the value 0 in the second column. Short text Step %(number)s/%(total)s Students see their result as passed or failed. Students see their result as points/max-points, and they can see if the number of points is a passing or a failing grade. Subject administrator The grading system is not configured correctly. This can happen if you or another admin has started reconfiguring the grading system, and did no complete the wizard. The result of grading with the selected grading system, &ldquo;%(plugintitle)s&rdquo;, is a number between zero and a value you have to configure. Please configure the maximum possible number of points. The system for grading students and providing feedback is very flexible in Devilry. Common for all methods of grading (passed/failed, points, A-F, ...) is that the end result is the following information: This means that no students have received feedback yet, but at at least one examiner has started giving feedback. This selection can not be reverted. You will have to re-run this wizard later to change your selection. Unordered list Use this Warning You SHOULD NOT reconfigure the grading system for this assignment. A least one student has already been given feedback. If you reconfigure the grading system, you should consider providing new feedback to all students. You can reconfigure the grading system for this assignment, but be careful, at least one examiner has saved a feedback draft. You can safely reconfigure the grading system for this assignment. You select the number of points required to pass in the next step of this wizard. You set up a table mapping points to a grade. Use this if you want to grade your students according to some scale, such as A-F. Your examiners/correctors may provide this information in many ways; by specifying a numeric value, by selecting approved, by answering a set of questions, and so on. Each of these different ways of providing feedback is a plugin to the grading system in Devilry. without preview Project-Id-Version: PACKAGE VERSION
Report-Msgid-Bugs-To: 
POT-Creation-Date: 2014-01-20 02:43+0100
PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE
Last-Translator: FULL NAME <EMAIL@ADDRESS>
Language-Team: LANGUAGE <LL@li.org>
Language: 
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1)
 
                Dersom ingen plugins listet opp på førstesiden av <em>Rekonfigurer karaktersystemet</em> møter dine behov, ta kontakt din lokale Devilry systemadministrator, eller med utviklerne av åpen-kildekodeprosjektet Devilry direkte på %(websitelink)s.
             %(percent)s%% Ferdig En mer utfyllende tekstene studentene kan se. Dette er vanligvis den detaljerte tilbakemeldingen. Dette feltet autogeneres av enkelte plugins basert på informasjon fra retterne. Her er mulighetene mange En veldig kort tekst ment til å gi en beskrivelse for studentene. For eksempel: "Godkjent", "B" eller "7/10". Legg til flere rader Enhver karakter i Devilry er representert med et nummer. Nummeret brukes i statistikk og for automatisk kalkulering av karakterer. Poeng er ikke direkte tilgjengelig for studentene men enkelte karaktersystemer velger å gjøre det synlig gjennom "Korttekst" (nedenfor) Som en tekst fra en forhåndsdefinert tabell Som bestått eller ikke bestått Som poeng Før du kan gi tilbakemeldinger til studentene, må du rekonfigurer karaktersystemet for denne oppgaven. Sitat Fet Konfigurer Gjeldende konfigurasjon Devilry inkluderer en plugin-arkitektur for karaktersetting. Dette gjør det enkelt å håndtere alle ulike måter å definere karakteren Endre Endre utkast Endre tilbakemelding Eksempel Tilbakemeldingstekst Ferdig Karaktersystem Overskrift Overskrift 1 Overskrift 2 Overskrift 3 Hjelp Hjem Hvordan skal resultatet presenteres for studenten? Hvordan vil du gi tilbakemelding til studentene= Hvordan vil du gi tilbakemelding til studentene? Dersom ingen av valgene for konfigurasjon faller i smak, gå tilbake og les om retteplugins Sett inn link Kursiv LaTeX matematikk Lang tekst Link poeng til karakter Maksimalt antall poeng Mininalt antall poeng nødvendig for å bestå Neste Det er ikke konfigurert noe karaktersystem. Årsåken kan være at oppgaven var opprettet i Devilry versjon 1.3.6 eller eldre Ingen studenter har mottatt tilbakemelding og ingen retter har lagret noe utkast til tilbakemelding En eller flere av de valgte gruppene har ingen innleveringer Ordna liste Velg hvordan du vil gi tilbakemelding til studentene fra listen nedenfor. Du må fortsette stegene videre i konfigurasjonen som må gjøres komplett før noen oppgaver kan bli rettet på denne oppgaven Plugins og hvorfor du kanskje vil lære mer Poeng Forhåndsvisning Forhåndsvis tilbakemelding Forrige Programmeringskode Programmeringsspråk Publiser Rekonfigurere Rekonfigurer karaktersystemet Lagre utkast Velg hvordan resultatene skal presenteres Velg karakteren nødvendig for å bestå Velg karakteren som er nødvendig for å bestå oppgaven Definer maksimalt antall poeng Definer minimum antall poeng nødvendig for å bestå Definer hvordan du ønsker å linke poeng til karakter. Spesifiser karakteren i den første kolonnen og den minimale poengsum for å oppnå karakteren i den andre kolonnen. Den første raden må ha verdien 0 i den andre kolonnen Korttekst Steg %(number)s/%(total)s Studentene ser resultatet som bestått ikke bestått Studentene ser resultat som antall oppnådde poeng og i tillegg se om det er nok til å bestå Kursadministrator Karaktersystemet er ikke konfigurert korrekt. Årsaken kan være at en annen med administratortilgang har startet rekonfigurering av karaktersystemet uten å fullføre. Resultatet av karaktersetting med det valgte oppsettet, &ldquo;%(plugintitle)s&rdquo;, er et nummer mellom 0 og en verdi du selv definerer.  Definer det maksimale antall poeng. Systemet for karaktersetting og mulighetene rundt tilbakemeldinger er meget fleksibelt i Devilry. Felles for alle metoder er at sluttresultatet består av følgende: Dette betyr at ingen har mottatt tilbakemelding, men minst en retter har startet retteprosessen. Dette valget kan ikke reverseres. Du må gjenta konfigureringsprosessen om igjen for å endre. Uordned liste Bruk dette Advarsel Du BØR IKKE rekonfigurere karaktersystemet på denne oppgaven. Minst en student har allerede blitt gitt tilbakemelding. Dersom du går videre bør du vurdere å gi nye tilbakemeldinger til alle studenter. Du kan rekonfigurere karaktersystemet for denne oppgaven, men vær obs på at minst en retter har lagret et utkast til tilbakemelding Du kan trygt endre konfigurasjonen av karaktersystemet for denne oppgaven. Du bestemmet antall poeng nødvendig for å bestå i neste steg Du setter opp en tabell som definerer koblingen mellom poeng og karakter. Bruk denne om du ønsker å sette karakter fra en skala som for eksempel A til F. Dine rettere kan gi denne informasjonen videre på mange forskjellige måter: Ved å spesifisere en numerisk verdi, ved å velge godkjent, ved å besvare et sett spørsmål og mer til. Hver av disse måtene virkeliggjøres gjennom et plugin til Devilry uten forhåndsvisning 