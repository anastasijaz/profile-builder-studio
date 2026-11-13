-- Melt: refresh the fake profiles' prompts (Lovable style). Safe to run more than once.
delete from public.profile_prompts
where user_id in (select id from auth.users where email like 'seed+%@melt.test');

insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'My first 6c outdoor — Frankenjura in May.', 0 from auth.users where email = 'seed+lena@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', '10k in 47:30. Slowly chipping at it.', 1 from auth.users where email = 'seed+lena@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'How to approach me at the gym…', 'Spot me on the overhang and we''re 80% there.', 2 from auth.users where email = 'seed+lena@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Peanut butter + banana on rye, no negotiations.', 3 from auth.users where email = 'seed+lena@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'One bouldering taster in 2019. Chalk''s been in my bag ever since.', 4 from auth.users where email = 'seed+lena@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Berlin Marathon. Sub-3 or bust.', 0 from auth.users where email = 'seed+jonas@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Post-workout ritual…', 'Cold shower, oat-milk flat white, repeat.', 1 from auth.users where email = 'seed+jonas@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Race I''d do with a stranger…', 'A messy 5k followed by ramen.', 2 from auth.users where email = 'seed+jonas@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Marathon in 3:04. Those four minutes live rent-free.', 3 from auth.users where email = 'seed+jonas@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Salted caramel gel at km 30. Tastes like hope.', 4 from auth.users where email = 'seed+jonas@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'Got dragged to a class at 16, never left the mat.', 0 from auth.users where email = 'seed+mira@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'How to approach me at the gym…', 'Ask which playlist I''m on. Always the right answer.', 1 from auth.users where email = 'seed+mira@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Anything with tahini and dark chocolate.', 2 from auth.users where email = 'seed+mira@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'A 30-second handstand. Currently at 9.', 3 from auth.users where email = 'seed+mira@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Deadlift 110 kg. Yoga teachers lift too.', 4 from auth.users where email = 'seed+mira@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My simple pleasures…', 'Sunset surf, espresso, river runs in that order.', 0 from auth.users where email = 'seed+noah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Hyrox Berlin — sled push haunts my dreams.', 1 from auth.users where email = 'seed+noah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Race I''d do with a stranger…', 'Any trail half. Loser buys the Apfelschorle.', 2 from auth.users where email = 'seed+noah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Hyrox in 1:12. The wall balls nearly won.', 3 from auth.users where email = 'seed+noah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Post-workout ritual…', 'Protein shake in the car, windows down, one loud song.', 4 from auth.users where email = 'seed+noah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Beating my brother at padel. Just once.', 0 from auth.users where email = 'seed+felix@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Four goals in one Sunday league game. Still bringing it up.', 1 from auth.users where email = 'seed+felix@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'A ball, a garage door and very patient neighbours.', 2 from auth.users where email = 'seed+felix@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Brezel with butter at half-time.', 3 from auth.users where email = 'seed+felix@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'How to approach me at the gym…', 'Need a fifth for five-a-side? I''m in.', 4 from auth.users where email = 'seed+felix@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Bikepacking across the Alps — August, no hotels.', 0 from auth.users where email = 'seed+sofia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', '180 km around the Fränkische Schweiz in one day.', 1 from auth.users where email = 'seed+sofia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'Bought a bike to get to uni. Rode past it for three years.', 2 from auth.users where email = 'seed+sofia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Homemade oat bars, too much honey, zero regrets.', 3 from auth.users where email = 'seed+sofia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My simple pleasures…', 'Gravel roads, thermos coffee, no signal.', 4 from auth.users where email = 'seed+sofia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'My first full Ironman — Roth, July.', 0 from auth.users where email = 'seed+emilia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', '1.9 km open water in 31:00. The wetsuit did half the work.', 1 from auth.users where email = 'seed+emilia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'Swim club at 7. Got bored of lanes, added a bike and shoes.', 2 from auth.users where email = 'seed+emilia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Medjool dates stuffed with almond butter.', 3 from auth.users where email = 'seed+emilia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Post-workout ritual…', 'Sauna, then an irresponsible amount of pasta.', 4 from auth.users where email = 'seed+emilia@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Surfing the Eisbach for more than ten seconds.', 0 from auth.users where email = 'seed+luca@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', '22 runs in one day at Garmisch. My legs filed a complaint.', 1 from auth.users where email = 'seed+luca@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'Grew up on skis, tried surfing at 25, never recovered.', 2 from auth.users where email = 'seed+luca@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Kaiserschmarrn at the hut. It counts.', 3 from auth.users where email = 'seed+luca@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Race I''d do with a stranger…', 'Skinning up the Zugspitze. Loser carries the Glühwein.', 4 from auth.users where email = 'seed+luca@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'Our league final in June. We need a cheering section.', 0 from auth.users where email = 'seed+hannah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Eleven aces in a row. Witnesses exist.', 1 from auth.users where email = 'seed+hannah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'Too tall for ballet, perfect for volleyball.', 2 from auth.users where email = 'seed+hannah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Ice-cold watermelon after a beach game.', 3 from auth.users where email = 'seed+hannah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'How to approach me at the gym…', 'Ask me to join your beach team. I''ll say yes.', 4 from auth.users where email = 'seed+hannah@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Currently training for…', 'My purple belt. Slowly, painfully.', 0 from auth.users where email = 'seed+tim@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My current PR is…', 'Bench 140 kg. Still say please and thank you.', 1 from auth.users where email = 'seed+tim@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'My sport origin story…', 'One jiu-jitsu match on YouTube, signed up the next day.', 2 from auth.users where email = 'seed+tim@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Favourite snack bar…', 'Whatever the gym vending machine has at 9pm.', 3 from auth.users where email = 'seed+tim@melt.test';
insert into public.profile_prompts (user_id, question, answer, position)
select id, 'Post-workout ritual…', 'Ice bath, then döner. Balance.', 4 from auth.users where email = 'seed+tim@melt.test';

-- Check: each fake profile should have 5 prompts.
select u.email, count(pr.id) as prompts
from auth.users u left join public.profile_prompts pr on pr.user_id = u.id
where u.email like 'seed+%@melt.test' group by u.email order by u.email;
